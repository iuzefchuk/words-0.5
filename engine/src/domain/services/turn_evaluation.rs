use crate::domain::entities::Match;
use crate::domain::value_objects::{
    Dictionary, InventoryLetter, InventoryTile, PlayfieldAnchorCoordinates, PlayfieldCell, TurnComputation, TurnEvaluation,
    TurnPlacement, TurnValidationError,
};

pub fn evaluate(current_match: &Match, dictionary: &Dictionary) -> TurnEvaluation {
    match compute(current_match, dictionary) {
        Ok(computation) => TurnEvaluation::Valid { computation },
        Err(error) => TurnEvaluation::Invalid { error },
    }
}

fn compute(current_match: &Match, dictionary: &Dictionary) -> Result<TurnComputation, TurnValidationError> {
    let tiles = current_match.current_turn_tiles();
    let cells = validate_cells(current_match, &tiles)?;
    let placements = validate_placements(current_match, &tiles, &cells)?;
    let words = validate_words(dictionary, &placements)?;
    let score = compute_score(current_match, &cells, &placements);
    Ok(TurnComputation {
        placements,
        score,
        words,
    })
}

fn validate_cells(current_match: &Match, tiles: &[InventoryTile]) -> Result<Vec<PlayfieldCell>, TurnValidationError> {
    if tiles.is_empty() {
        return Err(TurnValidationError::InvalidTilePlacement);
    }
    let cells: Vec<PlayfieldCell> = current_match.resolve_placement(tiles).iter().map(|link| link.cell).collect();
    let touches_anchor = cells.iter().any(|&cell| {
        cell.is_center()
            || (current_match.history_has_prior_turns()
                && cell
                    .adjacents()
                    .any(|adjacent| current_match.is_cell_occupied(adjacent) && !cells.contains(&adjacent)))
    });
    if touches_anchor {
        Ok(cells)
    } else {
        Err(TurnValidationError::NoCellsUsableAsFirst)
    }
}

fn validate_placements(
    current_match: &Match,
    tiles: &[InventoryTile],
    cells: &[PlayfieldCell],
) -> Result<Vec<TurnPlacement>, TurnValidationError> {
    let axis = current_match
        .calculate_axis(cells)
        .ok_or(TurnValidationError::InvalidTilePlacement)?;
    let primary = current_match.build_placement(PlayfieldAnchorCoordinates { axis, cell: cells[0] }, tiles);
    if primary.len() <= 1 {
        return Err(TurnValidationError::InvalidTilePlacement);
    }
    let mut placements = vec![primary];
    for &cell in cells {
        let Some(tile) = current_match.find_tile_by_cell(cell) else {
            continue;
        };
        let secondary = current_match.build_placement(
            PlayfieldAnchorCoordinates {
                axis: axis.opposite(),
                cell,
            },
            &[tile],
        );
        if secondary.len() > 1 {
            placements.push(secondary);
        }
    }
    Ok(placements)
}

fn validate_words(dictionary: &Dictionary, placements: &[TurnPlacement]) -> Result<Vec<String>, TurnValidationError> {
    let words: Vec<String> = placements
        .iter()
        .map(|placement| {
            placement
                .iter()
                .map(|link| link.tile.letter())
                .map(InventoryLetter::to_char)
                .collect()
        })
        .collect();
    if dictionary.contains_all_words(&words) {
        Ok(words)
    } else {
        Err(TurnValidationError::WordNotInDictionary)
    }
}

fn compute_score(current_match: &Match, cells: &[PlayfieldCell], placements: &[TurnPlacement]) -> u32 {
    placements
        .iter()
        .map(|placement| {
            let mut score = 0;
            let mut multiplier = 1;
            for link in placement {
                let is_new = cells.contains(&link.cell);
                score += link.tile.points()
                    * if is_new {
                        current_match.letter_multiplier(link.cell)
                    } else {
                        1
                    };
                multiplier *= if is_new { current_match.word_multiplier(link.cell) } else { 1 };
            }
            score * multiplier
        })
        .sum()
}
