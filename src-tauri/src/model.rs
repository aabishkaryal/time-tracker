use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Category {
    pub uuid: String,
    pub name: String,
    pub icon: String,
    pub time: i64,
    pub archived: bool,
    pub current: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Timer {
    pub category_uuid: String,
    pub start_time: i64,
    pub duration: i64,
}
