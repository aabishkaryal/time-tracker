use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Category {
    pub name: String,
    pub icon: String,
    pub time: i64,
}

#[derive(Serialize, Deserialize)]
pub struct Timer {
    pub category_name: String,
    pub start_time: i64,
    pub duration: i64,
}
