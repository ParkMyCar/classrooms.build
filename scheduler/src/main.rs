use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use varisat::{CnfFormula, ExtendFormula, Lit, Solver, Var};

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct TimeSlot {
    pub day: u32,
    pub time: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub available_slots: Vec<TimeSlot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EducatorMeetingRequirement {
    pub educator_id: String,
    pub meetings_per_week: u32,
    pub meeting_duration_minutes: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Student {
    pub id: String,
    pub name: String,
    pub schedule: Schedule,
    pub educator_meeting_requirements: Vec<EducatorMeetingRequirement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Educator {
    pub id: String,
    pub name: String,
    pub schedule: Schedule,
}

pub struct Scheduler {
    students: Vec<Student>,
    educators: Vec<Educator>,
    formula: CnfFormula,
    meeting_vars: HashMap<(String, String, TimeSlot), Var>,
}

impl Scheduler {
    pub fn new(students: Vec<Student>, educators: Vec<Educator>) -> Self {
        Self {
            students,
            educators,
            formula: CnfFormula::new(),
            meeting_vars: HashMap::new(),
        }
    }

    // Create a variable representing a meeting between a student and educator at a specific time slot
    fn get_meeting_var(&mut self, student_id: &str, educator_id: &str, slot: &TimeSlot) -> Var {
        *self
            .meeting_vars
            .entry((
                student_id.to_string(),
                educator_id.to_string(),
                slot.clone(),
            ))
            .or_insert_with(|| self.formula.new_var())
    }

    // Add constraints to ensure each student meets with their required educators
    fn add_meeting_requirements(&mut self) {
        let Scheduler {
            students,
            educators,
            formula,
            meeting_vars,
        } = self;

        let student_requirements: Vec<_> = students
            .iter()
            .flat_map(|student| {
                student
                    .educator_meeting_requirements
                    .iter()
                    .map(move |req| (student, req))
            })
            .collect();

        for (student, requirement) in student_requirements {
            let educator = educators
                .iter()
                .find(|e| e.id == requirement.educator_id)
                .expect("Educator not found");

            // Create variables for all possible meeting slots
            let mut new_meeting_vars = Vec::new();
            for student_slot in &student.schedule.available_slots {
                for educator_slot in &educator.schedule.available_slots {
                    if student_slot.day == educator_slot.day
                        && student_slot.time == educator_slot.time
                    {
                        let var = meeting_vars
                            .entry((
                                student.id.to_string(),
                                educator.id.to_string(),
                                student_slot.clone(),
                            ))
                            .or_insert_with(|| formula.new_var());
                        new_meeting_vars.push(*var);
                    }
                }
            }

            // Add constraint: at least one meeting must be scheduled
            if !new_meeting_vars.is_empty() {
                let mut clause = Vec::new();
                for var in &new_meeting_vars {
                    clause.push(Lit::from_var(*var, false));
                }
                formula.add_clause(&clause);
            }

            // Add constraint: at most N meetings can be scheduled
            // This is a simplified version - in practice, you'd want to use a more sophisticated
            // encoding for the "at most N" constraint
            if requirement.meetings_per_week < new_meeting_vars.len() as u32 {
                for i in 0..new_meeting_vars.len() {
                    for j in (i + 1)..new_meeting_vars.len() {
                        let mut clause = Vec::new();
                        clause.push(Lit::from_var(new_meeting_vars[i], true));
                        clause.push(Lit::from_var(new_meeting_vars[j], true));
                        formula.add_clause(&clause);
                    }
                }
            }
        }
    }

    // Add constraints to prevent double-booking
    // fn add_no_double_booking_constraints(&mut self) {
    //     let student_educator_pairs: Vec<_> = self
    //         .students
    //         .iter()
    //         .flat_map(|student| {
    //             self.educators
    //                 .iter()
    //                 .map(move |educator| (student, educator))
    //         })
    //         .collect();

    //     for (student, educator) in student_educator_pairs {
    //         for slot in &student.schedule.available_slots {
    //             let var1 = self.get_meeting_var(&student.id, &educator.id, slot);

    //             // For each other educator, ensure we don't double-book
    //             for other_educator in &self.educators {
    //                 if other_educator.id != educator.id {
    //                     let var2 = self.get_meeting_var(&student.id, &other_educator.id, slot);

    //                     // Add constraint: can't have both meetings at the same time
    //                     let mut clause = Vec::new();
    //                     clause.push(Lit::from_var(var1, true));
    //                     clause.push(Lit::from_var(var2, true));
    //                     self.formula.add_clause(&clause);
    //                 }
    //             }
    //         }
    //     }
    // }

    pub fn solve(&mut self) -> Option<HashMap<(String, String, TimeSlot), bool>> {
        // Add all constraints
        self.add_meeting_requirements();
        // self.add_no_double_booking_constraints();

        // Create and solve the instance
        let mut solver = Solver::new();
        solver.add_formula(&self.formula);

        match solver.solve() {
            Ok(true) => {
                let model = solver.model().unwrap();
                let mut schedule = HashMap::new();

                for ((student_id, educator_id, slot), var) in &self.meeting_vars {
                    let is_scheduled = model.contains(&Lit::from_var(*var, false));
                    schedule.insert(
                        (student_id.clone(), educator_id.clone(), slot.clone()),
                        is_scheduled,
                    );
                }

                Some(schedule)
            }
            _ => None,
        }
    }
}

fn main() {
    // Example usage
    let students = vec![Student {
        id: "s1".to_string(),
        name: "Student 1".to_string(),
        schedule: Schedule {
            available_slots: vec![TimeSlot { day: 1, time: 9 }, TimeSlot { day: 1, time: 10 }],
        },
        educator_meeting_requirements: vec![EducatorMeetingRequirement {
            educator_id: "e1".to_string(),
            meetings_per_week: 1,
            meeting_duration_minutes: 30,
        }],
    }];

    let educators = vec![Educator {
        id: "e1".to_string(),
        name: "Educator 1".to_string(),
        schedule: Schedule {
            available_slots: vec![TimeSlot { day: 1, time: 9 }, TimeSlot { day: 1, time: 10 }],
        },
    }];

    let mut scheduler = Scheduler::new(students, educators);
    if let Some(schedule) = scheduler.solve() {
        println!("Found a valid schedule!");
        for ((student_id, educator_id, slot), is_scheduled) in schedule {
            if is_scheduled {
                println!(
                    "Student {} meets with Educator {} on day {} at time {}",
                    student_id, educator_id, slot.day, slot.time
                );
            }
        }
    } else {
        println!("No valid schedule found");
    }
}
