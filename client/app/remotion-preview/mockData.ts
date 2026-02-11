export const mockFolders = [
  {
    id: "f1",
    name: "Biology 101",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    parentId: null,
    path: ["f1"],
    metadata: {},
  },
  {
    id: "f2",
    name: "History Notes",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    parentId: null,
    path: ["f2"],
    metadata: {},
  },
];

export const mockFiles = [
  {
    id: "doc1",
    name: "Cell Structure Lecture",
    type: "pdf",
    url: "https://example.com/doc1.pdf",
    folderId: "f1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    status: "processed",
    summary: "Overview of cell membrane and organelles.",
    metadata: {},
  },
  {
    id: "doc2",
    name: "WWII Timeline",
    type: "pdf",
    url: "https://example.com/doc2.pdf",
    folderId: "f2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    status: "processed",
    summary: "Key events from 1939 to 1945.",
    metadata: {},
  },
];

export const mockQuizzes = [
  {
    id: "q1",
    title: "Cell Biology Quiz",
    description: "Test your knowledge on cell structures.",
    status: "ready", // Converted from 'generated' to 'ready' based on typical enum values found in similar projects, or keeping string if it matches type
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    documentId: "doc1",
    questions: [], // Populated below if needed for list view, but usually count is enough
    _count: { questions: 10 },
    language: "en",
    settings: {
      difficultyLevel: "Medium",
      numberOfQuestions: 10,
    },
  },
  {
    id: "q2",
    title: "European Front Quiz",
    description: "Battles and strategies.",
    status: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    documentId: "doc2",
    questions: [],
    _count: { questions: 15 },
    language: "en",
    settings: {
      difficultyLevel: "Hard",
      numberOfQuestions: 15,
    },
  },
];

export const mockFlashcardSets = [
  {
    id: "fs1",
    name: "Biology Terms",
    description: "Key terms for Biology exam.",
    status: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    documentId: "doc1",
    flashCards: [],
    _count: { cards: 20 },
    language: "en",
  },
  {
    id: "fs2",
    name: "History Dates",
    description: "Important dates to remember.",
    status: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    documentId: "doc2",
    flashCards: [],
    _count: { cards: 25 },
    language: "en",
  },
];

export const mockQuestions = [
  {
    id: "qu1",
    text: "What is the powerhouse of the cell?",
    type: "MCQ",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
    correctAnswer: "Mitochondria",
    explanation:
      "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions.",
    quizId: "q1",
  },
  {
    id: "qu2",
    text: "The cell membrane is primarily composed of:",
    type: "MCQ",
    options: ["Proteins", "Carbohydrates", "Phospholipid bilayer", "DNA"],
    correctAnswer: "Phospholipid bilayer",
    explanation:
      "The cell membrane implies a double layer of phospholipids with embedded proteins.",
    quizId: "q1",
  },
];

export const mockFlashcards = [
  {
    id: "fc1",
    front: "Mitochondria",
    back: "The powerhouse of the cell, responsible for generating ATP.",
    setId: "fs1",
  },
  {
    id: "fc2",
    front: "Nucleus",
    back: "The control center of the cell, containing genetic material (DNA).",
    setId: "fs1",
  },
];

export const mockNoteContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Study Notes: Biology" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Remember to review the diagram of the cell." },
      ],
    },
  ],
};
