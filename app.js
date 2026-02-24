import axios from "axios";

/* =========================
   CONFIG
========================= */
const QUOTE_API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";
const TASKS_API_BASE = "http://localhost:3000/api/v1/tasks";
const NOTES_API_BASE = "http://localhost:3000/api/v1/notes";

/* =========================
   QUOTE FEATURE
========================= */
const loadQuote = async (category = "general") => {
  try {
    const response = await axios.get(`${QUOTE_API_BASE}/quotes`, {
      params: { category },
    });

    const { quote, author } = response.data;
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");

    if (quoteText) quoteText.textContent = `"${quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = author;
  } catch (error) {
    console.error("Error loading quote:", error);
  }
};

const wireQuoteEvents = () => {
  const button = document.getElementById("new-quote-btn");
  const select = document.getElementById("quote-category-select");

  if (button) button.addEventListener("click", () => loadQuote(select?.value || "general"));
  if (select) select.addEventListener("change", () => loadQuote(select.value));
};

/* =========================
   TASKS FEATURE
========================= */
const loadTasks = async () => {
  try {
    const response = await axios.get(TASKS_API_BASE);
    const tasks = response.data;
    const taskList = document.querySelector(".task-list");
    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach(task => {
      const li = document.createElement("li");
      li.classList.add("task-item");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.finished === 1;
      checkbox.addEventListener("change", async () => {
        await toggleTaskCompletion(task.id, checkbox.checked ? 1 : 0);
      });

      const span = document.createElement("span");
      span.textContent = task.task;

      li.appendChild(checkbox);
      li.appendChild(span);
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
};

const toggleTaskCompletion = async (taskId, finished) => {
  try {
    await axios.patch(`${TASKS_API_BASE}/${taskId}`, { finished });
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

const addTask = async () => {
  const input = document.getElementById("new-task");
  if (!input) return;

  const taskText = input.value.trim();
  if (!taskText) return;

  try {
    await axios.post(TASKS_API_BASE, { task: taskText });
    input.value = "";
    await loadTasks();
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const wireTaskEvents = () => {
  const addButton = document.getElementById("add-task-btn");
  const input = document.getElementById("new-task");

  if (addButton) addButton.addEventListener("click", addTask);
  if (input) input.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await addTask();
    }
  });
};

/* =========================
   NOTES FEATURE
========================= */
let notesOriginal = "";

const loadNotes = async () => {
  try {
    const response = await axios.get(NOTES_API_BASE);
    const notesArea = document.getElementById("notes-text");
    const saveButton = document.getElementById("save-notes-btn");

    if (notesArea) {
      notesOriginal = response.data.notes || "";
      notesArea.value = notesOriginal;
      if (saveButton) saveButton.disabled = true;

      notesArea.addEventListener("input", () => {
        if (saveButton) saveButton.disabled = notesArea.value === notesOriginal;
      });
    }
  } catch (error) {
    console.error("Error loading notes:", error);
  }
};

const saveNotes = async () => {
  const notesArea = document.getElementById("notes-text");
  const saveButton = document.getElementById("save-notes-btn");
  if (!notesArea || !saveButton) return;

  try {
    const response = await axios.put(NOTES_API_BASE, { notes: notesArea.value });
    notesOriginal = response.data.notes;
    saveButton.disabled = true;
  } catch (error) {
    console.error("Error saving notes:", error);
  }
};

const wireNotesEvents = () => {
  const saveButton = document.getElementById("save-notes-btn");
  if (saveButton) saveButton.addEventListener("click", saveNotes);
};

/* =========================
   INIT
========================= */
const init = async () => {
  wireQuoteEvents();
  const select = document.getElementById("quote-category-select");
  await loadQuote(select?.value || "general");

  wireTaskEvents();
  await loadTasks();

  wireNotesEvents();
  await loadNotes();
};

/* =========================
   EXPORT
========================= */
export { init, loadQuote, wireQuoteEvents, loadTasks, wireTaskEvents, loadNotes, wireNotesEvents };

init();