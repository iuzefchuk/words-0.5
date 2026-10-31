use crate::domain::entities::Match;
use crate::domain::services::shuffle::shuffle;
use crate::domain::services::turn_evaluation;
use crate::domain::value_objects::{
    CrossCheckTable, Dictionary, DictionaryNode, InventoryLetter, InventoryTile, MatchPlayer, PlayfieldAnchorCoordinates,
    PlayfieldAxis, PlayfieldCell, TurnComputation, TurnEvaluation, TurnLink, TurnPlacement,
};

pub struct TurnGenerationContext<'d> {
    cross_check_table: CrossCheckTable,
    dictionary: &'d Dictionary,
    r#match: Match,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TurnGenerationResult {
    pub computation: TurnComputation,
    pub placement: TurnPlacement,
}

impl<'d> TurnGenerationContext<'d> {
    pub fn create(r#match: &mut Match, dictionary: &'d Dictionary) -> Self {
        let fork = r#match.fork();
        let cross_check_table =
            CrossCheckTable::precompute(dictionary, |cell| fork.find_tile_by_cell(cell).map(InventoryTile::letter));
        Self {
            cross_check_table,
            dictionary,
            r#match: fork,
        }
    }
}

pub fn results(context: &mut TurnGenerationContext<'_>, player: MatchPlayer) -> impl Iterator<Item = TurnGenerationResult> {
    TurnGenerator::new(context, player)
}

pub fn find_best_result(
    context: &mut TurnGenerationContext<'_>,
    player: MatchPlayer,
    attempts_limit: usize,
) -> Option<TurnGenerationResult> {
    results(context, player)
        .take(attempts_limit)
        .fold(None, |best, result| match best {
            Some(best) if best.computation.score >= result.computation.score => Some(best),
            _ => Some(result),
        })
}

type TilesByLetter = [Vec<InventoryTile>; InventoryLetter::COUNT];

#[derive(Clone, Copy, Debug)]
struct Traversal {
    node: DictionaryNode,
    position: isize,
}

#[derive(Clone, Copy, Debug)]
struct Candidate {
    cell: PlayfieldCell,
    position: isize,
    resolution: Option<InventoryTile>,
}

#[derive(Clone, Copy, Debug)]
enum Task {
    ApplyResolution {
        cell: PlayfieldCell,
        letter: InventoryLetter,
        tile: InventoryTile,
    },
    CalculateCandidate(Traversal),
    EvaluateTraversal(Traversal),
    ExtendLeft {
        depth: usize,
        length: usize,
        node: DictionaryNode,
    },
    PlaceLeft {
        cell: PlayfieldCell,
        depth: usize,
        length: usize,
        letter: InventoryLetter,
        node: DictionaryNode,
    },
    ResolveCandidate {
        candidate: Candidate,
        traversal: Traversal,
    },
    ReverseResolution {
        letter: InventoryLetter,
        tile: InventoryTile,
    },
    UndoLeft {
        letter: InventoryLetter,
        tile: InventoryTile,
    },
    ValidateTraversal(Traversal),
}

struct TraversalState {
    anchor_position: usize,
    line: [PlayfieldCell; PlayfieldCell::PER_AXIS],
    opposite_axis: PlayfieldAxis,
    placement: TurnPlacement,
    stack: Vec<Task>,
    tiles: TilesByLetter,
}

struct TurnGenerator<'c, 'd> {
    context: &'c mut TurnGenerationContext<'d>,
    current: Option<TraversalState>,
    pristine_tiles: TilesByLetter,
    traversals: std::vec::IntoIter<PlayfieldAnchorCoordinates>,
}

impl<'c, 'd> TurnGenerator<'c, 'd> {
    fn new(context: &'c mut TurnGenerationContext<'d>, player: MatchPlayer) -> Self {
        let mut pristine_tiles: TilesByLetter = std::array::from_fn(|_| Vec::new());
        for &tile in context.r#match.get_tiles_for(player) {
            pristine_tiles[tile.letter().index()].push(tile);
        }
        let traversals = if pristine_tiles.iter().all(Vec::is_empty) {
            Vec::new()
        } else {
            context
                .r#match
                .anchor_cells()
                .into_iter()
                .flat_map(|cell| PlayfieldAxis::ALL.map(|axis| PlayfieldAnchorCoordinates { axis, cell }))
                .collect()
        };
        Self {
            context,
            current: None,
            pristine_tiles,
            traversals: traversals.into_iter(),
        }
    }

    fn start_traversal(&self, coordinates: PlayfieldAnchorCoordinates) -> TraversalState {
        let line = coordinates.line();
        let anchor_position = coordinates.position();
        let mut state = TraversalState {
            anchor_position,
            line,
            opposite_axis: coordinates.axis.opposite(),
            placement: Vec::new(),
            stack: Vec::new(),
            tiles: self.pristine_tiles.clone(),
        };
        let r#match = &self.context.r#match;
        let dictionary = self.context.dictionary;
        let left_occupied = anchor_position > 0 && r#match.is_cell_occupied(line[anchor_position - 1]);
        if left_occupied {
            let mut start = anchor_position - 1;
            while start > 0 && r#match.is_cell_occupied(line[start - 1]) {
                start -= 1;
            }
            let node = line[start..anchor_position]
                .iter()
                .try_fold(dictionary.root(), |node, &cell| {
                    let tile = r#match.find_tile_by_cell(cell)?;
                    dictionary.step(node, tile.letter())
                });
            if let Some(node) = node {
                state.stack.push(Task::EvaluateTraversal(Traversal {
                    node,
                    position: anchor_position.cast_signed() - 1,
                }));
            }
        } else {
            let left_limit = (0..anchor_position)
                .rev()
                .take_while(|&position| !r#match.is_cell_occupied(line[position]))
                .count();
            for length in (0..=left_limit).rev() {
                state.stack.push(Task::ExtendLeft {
                    depth: 0,
                    length,
                    node: dictionary.root(),
                });
            }
        }
        state
    }
}

impl Iterator for TurnGenerator<'_, '_> {
    type Item = TurnGenerationResult;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
            if self.current.is_none() {
                let coordinates = self.traversals.next()?;
                self.current = Some(self.start_traversal(coordinates));
            }
            let Self { context, current, .. } = self;
            let state = current.as_mut().expect("a traversal is in progress");
            while let Some(task) = state.stack.pop() {
                if let Some(result) = execute(context, state, task) {
                    return Some(result);
                }
            }
            restore_placements(context, state);
            *current = None;
        }
    }
}

fn execute(context: &mut TurnGenerationContext<'_>, state: &mut TraversalState, task: Task) -> Option<TurnGenerationResult> {
    let dictionary = context.dictionary;
    match task {
        Task::ApplyResolution { cell, letter, tile } => {
            let popped = state.tiles[letter.index()].pop();
            debug_assert_eq!(popped, Some(tile));
            state.placement.push(TurnLink { cell, tile });
            context
                .r#match
                .place_tile(cell, tile)
                .expect("the generator places rack tiles on empty cells");
        }
        Task::CalculateCandidate(traversal) => {
            let position = traversal.position + 1;
            let cell = state.line[position.cast_unsigned()];
            let candidate = Candidate {
                cell,
                position,
                resolution: context.r#match.find_tile_by_cell(cell),
            };
            state.stack.push(Task::ResolveCandidate { candidate, traversal });
        }
        Task::EvaluateTraversal(traversal) => {
            if !state.placement.is_empty()
                && dictionary.is_final(traversal.node)
                && let TurnEvaluation::Valid { computation } = turn_evaluation::evaluate(&context.r#match, dictionary)
            {
                return Some(TurnGenerationResult {
                    computation,
                    placement: state.placement.clone(),
                });
            }
            state.stack.push(Task::ValidateTraversal(traversal));
        }
        Task::ExtendLeft { depth, length, node } => extend_left(context, state, node, length, depth),
        Task::PlaceLeft {
            cell,
            depth,
            length,
            letter,
            node,
        } => {
            let tile = state.tiles[letter.index()].pop()?;
            state.placement.push(TurnLink { cell, tile });
            context
                .r#match
                .place_tile(cell, tile)
                .expect("the generator places rack tiles on empty cells");
            state.stack.push(Task::UndoLeft { letter, tile });
            state.stack.push(Task::ExtendLeft {
                depth: depth + 1,
                length,
                node,
            });
        }
        Task::ResolveCandidate { candidate, traversal } => {
            if let Some(tile) = candidate.resolution {
                if let Some(node) = dictionary.step(traversal.node, tile.letter()) {
                    state.stack.push(Task::EvaluateTraversal(Traversal {
                        node,
                        position: candidate.position,
                    }));
                }
            } else {
                explore_resolutions(context, state, traversal, candidate);
            }
        }
        Task::ReverseResolution { letter, tile } => {
            state.tiles[letter.index()].push(tile);
            state.placement.pop();
            context
                .r#match
                .undo_place_tile(tile)
                .expect("the generator undoes its own placements");
        }
        Task::UndoLeft { letter, tile } => {
            context
                .r#match
                .undo_place_tile(tile)
                .expect("the generator undoes its own placements");
            state.placement.pop();
            state.tiles[letter.index()].push(tile);
        }
        Task::ValidateTraversal(traversal) => {
            if traversal.position != PlayfieldCell::PER_AXIS.cast_signed() - 1 {
                state.stack.push(Task::CalculateCandidate(traversal));
            }
        }
    }
    None
}

fn extend_left(
    context: &mut TurnGenerationContext<'_>,
    state: &mut TraversalState,
    node: DictionaryNode,
    length: usize,
    depth: usize,
) {
    if depth == length {
        state.stack.push(Task::EvaluateTraversal(Traversal {
            node,
            position: state.anchor_position.cast_signed() - 1,
        }));
        return;
    }
    let cell = state.line[state.anchor_position - length + depth];
    let mask = context.cross_check_table.mask(state.opposite_axis, cell);
    let mut children: Vec<(InventoryLetter, DictionaryNode)> = context
        .dictionary
        .children(node)
        .filter(|&(letter, _)| CrossCheckTable::allows(mask, letter))
        .collect();
    shuffle(&mut children, 1, context.r#match.randomizer_mut());
    for (letter, child) in children.into_iter().rev() {
        state.stack.push(Task::PlaceLeft {
            cell,
            depth,
            length,
            letter,
            node: child,
        });
    }
}

fn explore_resolutions(
    context: &mut TurnGenerationContext<'_>,
    state: &mut TraversalState,
    traversal: Traversal,
    candidate: Candidate,
) {
    let mask = context.cross_check_table.mask(state.opposite_axis, candidate.cell);
    let mut tasks = Vec::new();
    for (letter, child) in context.dictionary.children(traversal.node) {
        if !CrossCheckTable::allows(mask, letter) {
            continue;
        }
        let Some(&tile) = state.tiles[letter.index()].last() else {
            continue;
        };
        tasks.push(Task::ApplyResolution {
            cell: candidate.cell,
            letter,
            tile,
        });
        tasks.push(Task::EvaluateTraversal(Traversal {
            node: child,
            position: candidate.position,
        }));
        tasks.push(Task::ReverseResolution { letter, tile });
    }
    if tasks.is_empty() {
        return;
    }
    shuffle(&mut tasks, 3, context.r#match.randomizer_mut());
    for task in tasks.into_iter().rev() {
        state.stack.push(task);
    }
}

fn restore_placements(context: &mut TurnGenerationContext<'_>, state: &mut TraversalState) {
    while let Some(link) = state.placement.pop() {
        context
            .r#match
            .undo_place_tile(link.tile)
            .expect("the generator undoes its own placements");
        state.tiles[link.tile.letter().index()].push(link.tile);
    }
}
