
export enum Category {
  BodyPosition = "Body position",
  PeopleReaction = "People initial reaction",
  PPE = "PPE",
  Procedures = "Procedures",
  ToolsAndEquipment = "Tools and equipment",
  WorkEnvironment = "Work Environment",
  Pollution = "Pollution",
  FoodSafety = "Food safety"
}

export const CategoryDisplayNames: Record<Category, string> = {
  [Category.BodyPosition]: "Ergonomics & Positional Safety",
  [Category.PeopleReaction]: "Behavioral Response Analysis",
  [Category.PPE]: "Protective Equipment Integrity",
  [Category.Procedures]: "Operational Protocol Standards",
  [Category.ToolsAndEquipment]: "Tools & Equipment Integrity",
  [Category.WorkEnvironment]: "Workplace Environmental Assessment",
  [Category.Pollution]: "Environmental Stewardship",
  [Category.FoodSafety]: "Food Quality & Safety Audit"
};

export const SubCategoryMap: Record<Category, string[]> = {
  [Category.BodyPosition]: [
    "Ascending/Descending", "Grip/Force", "Lifting/Lowering", "Line of Fire",
    "Pivoting/Twisting", "Posture", "Bank of Burns", "Risk of Falling", "Others"
  ],
  [Category.PeopleReaction]: [
    "Adapting the Task", "Changing Position", "Stopping the Task", "Other Observations"
  ],
  [Category.PPE]: [
    "Head (Hard Hats)", "Eye/Face Shields", "Hearing Protection", "Respiratory Masks",
    "Body (High-Vis)", "Hand (Gloves)", "Feet (Steel-Toe)", "Others"
  ],
  [Category.Procedures]: [
    "Adequate/Not Followed", "Inadequate Procedures", "LOTO / Energy Isolation",
    "No Written Protocol", "Other Procedural Gaps"
  ],
  [Category.ToolsAndEquipment]: [
    "Appropriate for the Task", "Selection & Condition", "Correct Application", "Other Observations"
  ],
  [Category.WorkEnvironment]: [
    "Workspace Appropriateness", "Selection & Environmental Condition", "Utilization of Space", "Other Environmental Factors"
  ],
  [Category.Pollution]: [
    "Air Quality", "Land & Soil Integrity", "Water Protection", "Other Environmental Impacts"
  ],
  [Category.FoodSafety]: [
    "Cross-Contamination Risks", "External Openings & Seal Integrity", "Access Control",
    "Raw Material Integrity", "Pest Activity & Prevention", "Personal Hygiene Standards"
  ]
};

export interface Observation {
  id: string;
  category: Category;
  subCategory: string;
  location: string;
  observerName: string;
  dateTime: string;
  isSafe: boolean;
  isImmediateRisk?: boolean;
  comments: string;
  correctiveAction?: string;
  imageUrl?: string;
  aiAnalysis?: string;
  severity?: 'low' | 'medium' | 'high';
}

export type ViewState = 'form' | 'history';
