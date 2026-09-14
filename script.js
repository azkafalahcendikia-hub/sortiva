const algorithmSelect = document.getElementById("algorithm");
const dataInput = document.getElementById("dataInput");
const generateBtn = document.getElementById("generateBtn");
const visualizeBtn = document.getElementById("visualizeBtn");
const speedRange = document.getElementById("speedRange");
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const inputError = document.getElementById("inputError");

const visualizer = document.getElementById("visualizer");
const progressBar = document.getElementById("progressBar");
const stepNumber = document.getElementById("stepNumber");
const stepTotal = document.getElementById("stepTotal");
const stepMessage = document.getElementById("stepMessage");
const learningText = document.getElementById("learningText");
const comparisonCount = document.getElementById("comparisonCount");
const moveCount = document.getElementById("moveCount");
const statAlgorithm = document.getElementById("statAlgorithm");

const algorithmTitle = document.getElementById("algorithmTitle");
const algorithmDescription = document.getElementById("algorithmDescription");
const bestComplexity = document.getElementById("bestComplexity");
const averageComplexity = document.getElementById("averageComplexity");
const worstComplexity = document.getElementById("worstComplexity");
const spaceComplexity = document.getElementById("spaceComplexity");
const stabilityTag = document.getElementById("stabilityTag");
const memoryTag = document.getElementById("memoryTag");

const algorithmInfo = {
  bubble: {
    title: "Bubble Sort",
    description: "Repeatedly compares adjacent elements and swaps them when they are in the wrong order. Larger values gradually move toward the end of the list.",
    best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)",
    stable: "Stable", memory: "In-place"
  },
  selection: {
    title: "Selection Sort",
    description: "Finds the smallest element in the unsorted portion and places it at the beginning. The process repeats until the whole list is sorted.",
    best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)",
    stable: "Not stable", memory: "In-place"
  },
  insertion: {
    title: "Insertion Sort",
    description: "Builds a sorted portion one element at a time by taking the next value and inserting it into its correct position.",
    best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)",
    stable: "Stable", memory: "In-place"
  },
  quick: {
    title: "Quick Sort",
    description: "Selects a pivot and partitions the array into values smaller than or equal to the pivot and values larger than it, then recursively sorts both sides.",
    best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)*",
    stable: "Not stable", memory: "In-place",
    note: "*Average recursion stack; worst case can reach O(n)."
  }
};

let originalData = [8, 3, 5, 1, 7, 2];
let frames = [];
let currentStep = 0;
let timer = null;
let isPlaying = false;

function parseInput() {
  const tokens = dataInput.value.split(",").map(value => value.trim()).filter(Boolean);
  const values = tokens.map(Number);

  if (tokens.length < 2) throw new Error("Enter at least 2 numbers separated by commas.");
  if (tokens.length > 16) throw new Error("For a clear visualization, use at most 16 numbers.");
  if (values.some(value => !Number.isFinite(value))) throw new Error("Every item must be a valid number.");

  return values;
}

function makeFrame(arr, active = [], sorted = [], pivot = [], message = "", learning = "", comparisons = 0, moves = 0, heldValue = null, heldIndex = null) {
  return {
    values: [...arr],
    active: [...active],
    sorted: [...sorted],
    pivot: [...pivot],
    message,
    learning,
    comparisons,
    moves,
    heldValue,
    heldIndex
  };
}

function bubbleSort(input) {
  const arr = [...input];
  const result = [makeFrame(arr, [], [], [], "Ready to compare adjacent elements.", "Bubble Sort compares neighboring values and swaps them when the left value is larger.")];
  let comparisons = 0, moves = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      comparisons++;
      result.push(makeFrame(arr, [j, j + 1], Array.from({ length: i }, (_, k) => arr.length - 1 - k), [],
        `Comparing ${arr[j]} and ${arr[j + 1]}.`,
        arr[j] > arr[j + 1] ? `${arr[j]} is larger, so the pair must be swapped.` : `${arr[j]} is already before a larger or equal value, so no swap is needed.`, comparisons, moves));

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        moves++;
        swapped = true;
        result.push(makeFrame(arr, [j, j + 1], Array.from({ length: i }, (_, k) => arr.length - 1 - k), [],
          `Swapped positions ${j + 1} and ${j + 2}.`, `${arr[j]} moves before ${arr[j + 1]} after the swap.`, comparisons, moves));
      }
    }
    if (!swapped) break;
  }
  result.push(makeFrame(arr, [], Array.from({ length: arr.length }, (_, i) => i), [], "Sorting complete.", "All values are arranged from smallest to largest.", comparisons, moves));
  return result;
}

function selectionSort(input) {
  const arr = [...input];
  const result = [makeFrame(arr, [], [], [], "Ready to find the minimum value.", "Selection Sort scans the unsorted portion and remembers the smallest value.")];
  let comparisons = 0, moves = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    let min = i;
    result.push(makeFrame(arr, [i], Array.from({ length: i }, (_, k) => k), [],
      `Starting position ${i + 1}.`, "The left side is already sorted; now we search the remaining values.", comparisons, moves));

    for (let j = i + 1; j < arr.length; j++) {
      comparisons++;
      result.push(makeFrame(arr, [min, j], Array.from({ length: i }, (_, k) => k), [],
        `Comparing ${arr[min]} with ${arr[j]}.`, arr[j] < arr[min] ? `${arr[j]} becomes the new minimum candidate.` : `${arr[j]} is not smaller than the current minimum.`, comparisons, moves));
      if (arr[j] < arr[min]) min = j;
    }

    if (min !== i) {
      const minimum = arr[min];
      [arr[i], arr[min]] = [arr[min], arr[i]];
      moves++;
      result.push(makeFrame(arr, [i, min], Array.from({ length: i + 1 }, (_, k) => k), [],
        `Placed ${minimum} into the sorted portion.`, `${minimum} was the smallest value found in this pass.`, comparisons, moves));
    } else {
      result.push(makeFrame(arr, [i], Array.from({ length: i + 1 }, (_, k) => k), [],
        `${arr[i]} is already in the correct position.`, "No swap is necessary for this position.", comparisons, moves));
    }
  }

  result.push(makeFrame(arr, [], Array.from({ length: arr.length }, (_, i) => i), [], "Sorting complete.", "Every position now contains the correct value.", comparisons, moves));
  return result;
}

function insertionSort(input) {

  const arr = [...input];
  const result = [makeFrame(
    arr, [], [0], [],
    "The first element is already the sorted portion.",
    "Insertion Sort grows a sorted portion from left to right.",
    0, 0
  )];

  let comparisons = 0;
  let moves = 0;

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    let heldIndex = i;

    arr[i] = null;
    result.push(makeFrame(
      arr, [i], Array.from({ length: i }, (_, k) => k), [],
      `Picked ${key} as the key.`,
      `${key} is temporarily held while the sorted portion is scanned from right to left.`,
      comparisons, moves, key, heldIndex
    ));

    while (j >= 0) {
      const leftValue = arr[j];
      comparisons++;

      result.push(makeFrame(
        arr, [j, heldIndex], Array.from({ length: j }, (_, k) => k), [],
        `Compare ${leftValue} with key ${key}.`,
        leftValue > key
          ? `${leftValue} is greater than ${key}, so ${leftValue} must shift one position to the right.`
          : `${leftValue} is less than or equal to ${key}, so ${key} belongs immediately after it.`,
        comparisons, moves, key, heldIndex
      ));

      if (leftValue <= key) break;

      arr[j + 1] = leftValue;
      arr[j] = null;
      heldIndex = j;
      moves++;

      result.push(makeFrame(
        arr, [j + 1, heldIndex], Array.from({ length: j }, (_, k) => k), [],
        `Shifted ${leftValue} one position to the right.`,
        `The empty position moves left, while key ${key} remains held.`,
        comparisons, moves, key, heldIndex
      ));

      j--;
    }


    arr[heldIndex] = key;
    moves++;
    result.push(makeFrame(
      arr, [heldIndex], Array.from({ length: i + 1 }, (_, k) => k), [],
      `Inserted ${key} at position ${heldIndex + 1}.`,
      `The key is now in its correct position, so the sorted portion grows to ${i + 1} elements.`,
      comparisons, moves
    ));
  }

  result.push(makeFrame(
    arr, [], Array.from({ length: arr.length }, (_, i) => i), [],
    "Sorting complete.",
    "Each element has been inserted into the correct position.",
    comparisons, moves
  ));

  return result;
}
function quickSort(input) {
  const arr = [...input];
  const result = [makeFrame(
    arr, [], [], [],
    "Quick Sort is ready to choose a pivot.",
    "Quick Sort partitions the data around a pivot value."
  )];
  let comparisons = 0, moves = 0;
  const fixed = new Set();

  function sortedIndices(extra = []) {
    return [...new Set([...fixed, ...extra])].sort((a, b) => a - b);
  }

  function partition(low, high) {
    const pivotValue = arr[high];
    result.push(makeFrame(
      arr, [high], sortedIndices(), [high],
      `Pivot selected: ${pivotValue}.`,
      `The pivot divides this partition. Values less than or equal to ${pivotValue} move left; larger values stay right.`,
      comparisons, moves
    ));

    let storeIndex = low;

    for (let j = low; j < high; j++) {
      const currentValue = arr[j];
      comparisons++;

      result.push(makeFrame(
        arr, [j, high], sortedIndices(), [high],
        `Comparing ${currentValue} with pivot ${pivotValue}.`,
        currentValue <= pivotValue
          ? `${currentValue} belongs in the left partition.`
          : `${currentValue} belongs in the right partition.`,
        comparisons, moves
      ));

      if (currentValue <= pivotValue) {
        if (storeIndex !== j) {
          const leftValue = arr[storeIndex];
          const movedValue = arr[j];

          [arr[storeIndex], arr[j]] = [arr[j], arr[storeIndex]];
          moves++;

          result.push(makeFrame(
            arr, [storeIndex, j], sortedIndices(), [high],
            `Moved ${movedValue} to position ${storeIndex + 1}.`,
            `${movedValue} belongs in the left partition, so it swaps with ${leftValue}.`,
            comparisons, moves
          ));
        } else {
          result.push(makeFrame(
            arr, [j], sortedIndices(), [high],
            `${currentValue} is already in the left partition.`,
            `No swap is needed because ${currentValue} is already before the partition boundary.`,
            comparisons, moves
          ));
        }
        storeIndex++;
      }
    }

    const pivotIndex = storeIndex;

    if (pivotIndex !== high) {
      const displacedValue = arr[pivotIndex];
      [arr[pivotIndex], arr[high]] = [arr[high], arr[pivotIndex]];
      moves++;

      result.push(makeFrame(
        arr, [pivotIndex, high], sortedIndices([pivotIndex]), [pivotIndex],
        `Placed pivot ${pivotValue} at position ${pivotIndex + 1}.`,
        `${pivotValue} is now in its final position. ${displacedValue} moves to the pivot's former position.`,
        comparisons, moves
      ));
    } else {
      result.push(makeFrame(
        arr, [pivotIndex], sortedIndices([pivotIndex]), [pivotIndex],
        `Pivot ${pivotValue} is already at position ${pivotIndex + 1}.`,
        `The pivot is already in its final position, so no swap is needed.`,
        comparisons, moves
      ));
    }

    fixed.add(pivotIndex);
    return pivotIndex;
  }

  function sort(low, high) {
    if (low > high) return;

    if (low === high) {
      fixed.add(low);
      result.push(makeFrame(
        arr, [low], sortedIndices(), [],
        `Single value ${arr[low]} is already sorted.`,
        "A partition with one value needs no further sorting.",
        comparisons, moves
      ));
      return;
    }

    const pivot = partition(low, high);
    sort(low, pivot - 1);
    sort(pivot + 1, high);
  }

  sort(0, arr.length - 1);
  result.push(makeFrame(
    arr, [], Array.from({ length: arr.length }, (_, i) => i), [],
    "Sorting complete.",
    "All partitions have been sorted.",
    comparisons, moves
  ));
  return result;
}

function clearError() {
  inputError.textContent = "";
  dataInput.classList.remove("invalid");
}

function generateFrames() {
  clearError();
  let data;
  try {
    data = parseInput();
  } catch (error) {
    inputError.textContent = error.message;
    dataInput.classList.add("invalid");
    throw error;
  }

  originalData = [...data];
  const selected = algorithmSelect.value;
  if (selected === "bubble") frames = bubbleSort(data);
  if (selected === "selection") frames = selectionSort(data);
  if (selected === "insertion") frames = insertionSort(data);
  if (selected === "quick") frames = quickSort(data);

  currentStep = 0;
  stopPlaying();
  renderFrame();
}

function renderFrame() {
  if (!frames.length) return;
  const frame = frames[currentStep];

  const maxValue = Math.max(...originalData.map(value => Math.abs(value)), 1);

  visualizer.innerHTML = "";
  frame.values.forEach((value, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar";
    const isKeySlot = frame.heldIndex === index && frame.heldValue !== null && value === null;

    if (frame.active.includes(index)) bar.classList.add("active");
    if (frame.sorted.includes(index)) bar.classList.add("sorted");
    if (frame.pivot.includes(index)) bar.classList.add("pivot");
    if (isKeySlot) bar.classList.add("key");

    const displayValue = isKeySlot ? frame.heldValue : value;

    if (displayValue === null) {
      bar.classList.add("hole");
      bar.style.height = "100%";
      bar.title = "Temporary open position";
      const label = document.createElement("span");
      label.textContent = "";
      bar.appendChild(label);
    } else {
      const height = Math.max(7, (Math.abs(displayValue) / maxValue) * 78);
      bar.style.height = `${height}%`;
      bar.title = isKeySlot ? `Key: ${displayValue}` : `Value: ${displayValue}`;
      const label = document.createElement("span");
      label.textContent = displayValue;
      bar.appendChild(label);
    }

    const indexLabel = document.createElement("div");
    indexLabel.className = "bar-index";
    indexLabel.textContent = `#${index + 1}`;

    wrapper.appendChild(bar);
    wrapper.appendChild(indexLabel);
    visualizer.appendChild(wrapper);
  });

  stepNumber.textContent = currentStep;
  stepTotal.textContent = Math.max(frames.length - 1, 0);
  stepMessage.textContent = frame.message;
  learningText.textContent = frame.learning;
  comparisonCount.textContent = frame.comparisons;
  moveCount.textContent = frame.moves;
  statAlgorithm.textContent = algorithmInfo[algorithmSelect.value].title;

  const progress = frames.length <= 1 ? 100 : (currentStep / (frames.length - 1)) * 100;
  progressBar.style.width = `${progress}%`;
  prevBtn.disabled = currentStep === 0;
  nextBtn.disabled = currentStep >= frames.length - 1;
}

function stopPlaying() {
  isPlaying = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  playBtn.textContent = "▶ Play";
}

function playAnimation() {
  if (!frames.length) return;
  if (currentStep >= frames.length - 1) currentStep = 0;
  isPlaying = true;
  playBtn.textContent = "❚❚ Pause";
  timer = setInterval(() => {
    if (currentStep >= frames.length - 1) {
      stopPlaying();
      return;
    }
    currentStep++;
    renderFrame();
  }, Math.max(80, 1100 - Number(speedRange.value)));
  renderFrame();
}

function updateAlgorithmInfo() {
  const info = algorithmInfo[algorithmSelect.value];
  algorithmTitle.textContent = info.title;
  algorithmDescription.textContent = info.description;
  bestComplexity.textContent = info.best;
  averageComplexity.textContent = info.average;
  worstComplexity.textContent = info.worst;
  spaceComplexity.textContent = info.space;
  stabilityTag.textContent = info.stable;
  memoryTag.textContent = info.memory;
  stabilityTag.title = info.stable;
  memoryTag.title = info.memory;
  generateFrames();
}

generateBtn.addEventListener("click", () => {
  const count = Math.floor(Math.random() * 6) + 8;
  const randomValues = Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10);
  dataInput.value = randomValues.join(", ");
  generateFrames();
});

visualizeBtn.addEventListener("click", () => {
  try { generateFrames(); } catch (_) { /* error message is shown inline */ }
});

algorithmSelect.addEventListener("change", () => {
  updateAlgorithmInfo();
});

playBtn.addEventListener("click", () => {
  if (isPlaying) stopPlaying();
  else playAnimation();
});

nextBtn.addEventListener("click", () => {
  stopPlaying();
  if (currentStep < frames.length - 1) { currentStep++; renderFrame(); }
});

prevBtn.addEventListener("click", () => {
  stopPlaying();
  if (currentStep > 0) { currentStep--; renderFrame(); }
});

resetBtn.addEventListener("click", () => {
  stopPlaying();
  dataInput.value = originalData.join(", ");
  try { generateFrames(); } catch (_) { /* impossible for valid originalData */ }
});

speedRange.addEventListener("input", () => {
  if (isPlaying) {
    stopPlaying();
    playAnimation();
  }
});

dataInput.addEventListener("input", clearError);

updateAlgorithmInfo();
