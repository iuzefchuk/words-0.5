use crate::domain::value_objects::Randomizer;

#[expect(clippy::cast_possible_truncation, clippy::cast_precision_loss, clippy::cast_sign_loss)]
pub fn shuffle<T>(items: &mut [T], group_size: usize, randomizer: &mut Randomizer) {
    assert!(group_size > 0, "group size must be positive");
    let length = items.len() - items.len() % group_size;
    let mut source = length.checked_sub(group_size);
    while let Some(source_index) = source {
        let groups = source_index / group_size + 1;
        let target_index = (randomizer.next_f64() * groups as f64).floor() as usize * group_size;
        for offset in 0..group_size {
            items.swap(source_index + offset, target_index + offset);
        }
        source = source_index.checked_sub(group_size);
    }
}
