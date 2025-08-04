// 계산기 기능
const display = document.getElementById('display');
let justCalculated = false;

function append(value) {
  const isNumber = /^[0-9.]$/.test(value);
  const isOperator = /^[+\-*/×÷]$/.test(value);
  const lastChar = display.value.slice(-1);

  if (justCalculated && isNumber) {
    display.value = '';
  }

  // 연산자 중복 방지
  if (isOperator && /[+\-*/×÷]/.test(lastChar)) {
    display.value = display.value.slice(0, -1);
  }

  // 중복 소수점 방지 (연산자 이후는 허용)
  if (value === '.' && display.value.includes('.') && !/[+\-*/×÷]/.test(lastChar)) {
    return;
  }

  // 소수점 다음에 연산자 입력 방지
  if (lastChar === '.' && isOperator) {
    return;
  }

  if (value === '*') {
    display.value += '×';
  } else {
    display.value += value;
  }

  justCalculated = false;
}

function calculate() {
  const lastChar = display.value.slice(-1);
  if (/[+\-*/×÷]/.test(lastChar)) return;

  try {
    const expression = display.value.replace(/×/g, '*').replace(/÷/g, '/');
    display.value = eval(expression);
    justCalculated = true;
  } catch (e) {
    display.value = 'Error';
    justCalculated = true;
  }
}

function clearDisplay() {
  display.value = '';
  justCalculated = false;
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

// === 그림판 요소 ===
const textArea = document.getElementById('textArea');
const canvas = document.getElementById('drawingCanvas');
const modeToggleBtn = document.getElementById('modeToggleBtn');
const ctx = canvas.getContext('2d');
const strokeControls = document.getElementById('strokeControls');
const strokeWidth = document.getElementById('strokeWidth');
const strokeValue = document.getElementById('strokeValue');
const strokeColor = document.getElementById('strokeColor');
const toggleToolBtn = document.getElementById('toggleToolBtn');

let isDrawing = false;
let erasing = false;
let history = [];
let previousPenWidth = parseFloat(strokeWidth.value);

ctx.lineCap = 'round';
ctx.strokeStyle = strokeColor.value;
ctx.lineWidth = previousPenWidth;

strokeWidth.addEventListener('input', () => {
  ctx.lineWidth = parseFloat(strokeWidth.value);
  strokeValue.textContent = strokeWidth.value;
  if (!erasing) {
    previousPenWidth = parseFloat(strokeWidth.value);
  }
});

strokeColor.addEventListener('input', () => {
  if (!erasing) {
    ctx.strokeStyle = strokeColor.value;
  }
});

function toggleTool() {
  erasing = !erasing;
  if (erasing) {
    previousPenWidth = parseFloat(strokeWidth.value);
    ctx.strokeStyle = '#f9f9f9';
    ctx.lineWidth = 9.5;
    strokeWidth.value = 9.5;
    strokeValue.textContent = '9.5';
    toggleToolBtn.textContent = '✏️ 펜';
  } else {
    ctx.strokeStyle = strokeColor.value;
    ctx.lineWidth = previousPenWidth;
    strokeWidth.value = previousPenWidth;
    strokeValue.textContent = previousPenWidth;
    toggleToolBtn.textContent = '🧽 지우개';
  }
}

function toggleMode() {
  const isTextVisible = textArea.style.display !== 'none';
  if (isTextVisible) {
    textArea.style.display = 'none';
    canvas.style.display = 'block';
    strokeControls.style.display = 'flex';
    resizeCanvas();
    modeToggleBtn.textContent = '📝 메모장';
  } else {
    canvas.style.display = 'none';
    strokeControls.style.display = 'none';
    textArea.style.display = 'block';
    modeToggleBtn.textContent = '🎨 그림판';
  }
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = parseFloat(strokeWidth.value);
  redrawHistory();
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  saveToHistory();
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

function saveToHistory() {
  try {
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.push(snapshot);
    if (history.length > 20) history.shift();
  } catch (e) {
    console.warn('Undo 저장 실패', e);
  }
}

function undo() {
  if (history.length > 0) {
    history.pop();
    const last = history[history.length - 1];
    if (last) ctx.putImageData(last, 0, 0);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  history = [];
}

function redrawHistory() {
  if (history.length > 0) {
    ctx.putImageData(history[history.length - 1], 0, 0);
  }
}

display.addEventListener('click', () => {
  display.focus();
});

// 키보드 입력 처리
window.addEventListener('keydown', (e) => {
  const isNumber = /^[0-9]$/.test(e.key);
  const isOperator = /^[+\-*/]$/.test(e.key);
  const isDot = e.key === '.';
  const isEnter = e.key === 'Enter';
  const isEquals = e.key === '=';
  const isBackspace = e.key === 'Backspace';
  const isEscape = e.key === 'Escape';

  const isInMemo = document.activeElement === textArea;
  if (isInMemo) return;

  // 계산기에 항상 포커스 유지
  display.focus();

  if (isNumber || isOperator || isDot) {
    e.preventDefault();
    append(e.key);
  } else if (isEnter || isEquals) {
    e.preventDefault();
    calculate();
  } else if (isBackspace) {
    e.preventDefault();
    backspace();
  } else if (isEscape) {
    e.preventDefault();
    clearDisplay();
  }
});

// 초기 상태 설정
window.onload = () => {
  textArea.style.display = 'block';
  canvas.style.display = 'none';
  strokeControls.style.display = 'none';
  modeToggleBtn.textContent = '🎨 그림판';
};


