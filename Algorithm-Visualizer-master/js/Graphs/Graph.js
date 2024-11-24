import GraphAlgorithms from './Algorithms.js';
import { explanations } from './explanations.js';

/**
 * Global state variables for grid management and interaction
 */
let gridArray = [];          // 2D array representing the grid cells
let startCoord;             // Starting point coordinates [row, col]
let endCoord;              // Ending point coordinates [row, col]
let rowCount, colCount;    // Grid dimensions
let graphAlgorithm;        // Instance of path finding algorithm

// Mouse interaction state
let isMouseDown = false;
let isDraggingStart = false;
let isDraggingEnd = false;

// Icons for start and end points
const START_ICON = `<i class="fas fa-running" style="font-size: 150%"></i>`;
const END_ICON = `<i class="fa fa-flag-checkered" style="font-size:150%;"></i>`;

// Default settings
let cellSize = 25;        // Default cell size in pixels
/**
 * Initialize the application when document is ready
 */
$(document).ready(() => {
    // Set initial grid dimensions
    rowCount = 30;
    colCount = 60;

    // Create and initialize the grid
    createGrid(rowCount, colCount);
    initializeStartEndPoints();

    // Set up event listeners
    setupEventListeners();
    
    // Initialize algorithm description
    updateAlgorithmDescription();
});

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Global mouse up handler
    document.addEventListener('mouseup', () => { isMouseDown = false; });

    // Algorithm selection change handler
    $('#algorithm').change(updateAlgorithmDescription);

    // Grid control handlers
    $('#visualize').click(startVisualization);
    $('#reset').click(() => {
        resetGrid();
        initializeStartEndPoints();
    });
}

/**
 * Create the grid with specified dimensions
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid
 */
function createGrid(rows, cols) {
    const board = $('#table');
    board.empty();
    board.css('grid-template-columns', `repeat(${cols}, 1fr)`);

    gridArray = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            const cell = createCell(i, j);
            board.append(cell);
            row.push(cell[0]);
        }
        gridArray.push(row);
    }
}

/**
 * Create a single cell with all necessary event handlers
 * @param {number} row - Row index of the cell
 * @param {number} col - Column index of the cell
 * @returns {jQuery} jQuery object representing the cell
 */
function createCell(row, col) {
    const cell = $('<div>', { 
        class: 'cell', 
        id: `${row},${col}` 
    });

    // Add mouse event handlers
    cell.mousedown(function(e) {
        isMouseDown = true;
        if (isStartPoint(this)) {
            isDraggingStart = true;
        } else if (isEndPoint(this)) {
            isDraggingEnd = true;
        }
    });

    cell.mouseover(function(e) {
        if (!isMouseDown || isStartPoint(this) || isEndPoint(this)) return;
        
        if (isDraggingStart) {
            updateStartPoint(this);
        } else if (isDraggingEnd) {
            updateEndPoint(this);
        } else if (isEmpty(this)) {
            markObstacle(this);
        }
    });

    cell.mouseup(() => {
        isDraggingEnd = false;
        isDraggingStart = false;
    });

    return cell;
}

/**
 * Update the start point to a new cell
 * @param {HTMLElement} newCell - The new cell to become the start point
 */
function updateStartPoint(newCell) {
    const coords = getCellCoordinates(newCell);
    newCell.innerHTML = START_ICON;
    newCell.classList.add('start');
    
    // Clear old start point
    gridArray[startCoord[0]][startCoord[1]].innerHTML = "";
    gridArray[startCoord[0]][startCoord[1]].classList.remove('start');
    
    startCoord = coords;
}

/**
 * Update the end point to a new cell
 * @param {HTMLElement} newCell - The new cell to become the end point
 */
function updateEndPoint(newCell) {
    const coords = getCellCoordinates(newCell);
    newCell.innerHTML = END_ICON;
    newCell.classList.add('end');
    
    // Clear old end point
    gridArray[endCoord[0]][endCoord[1]].innerHTML = "";
    gridArray[endCoord[0]][endCoord[1]].classList.remove('end');
    
    endCoord = coords;
}

/**
 * Initialize start and end points on the grid
 */
function initializeStartEndPoints() {
    startCoord = [Math.floor(rowCount / 2), Math.floor(colCount / 4)];
    endCoord = [Math.floor(rowCount / 2), Math.floor(3 * colCount / 4)];

    // Set start point
    gridArray[startCoord[0]][startCoord[1]].innerHTML = START_ICON;
    gridArray[startCoord[0]][startCoord[1]].classList.add('start');

    // Set end point
    gridArray[endCoord[0]][endCoord[1]].innerHTML = END_ICON;
    gridArray[endCoord[0]][endCoord[1]].classList.add('end');

    isDraggingStart = false;
    isDraggingEnd = false;
}

/**
 * Update the algorithm description based on selected algorithm
 */
function updateAlgorithmDescription() {
    const selectedAlgorithm = $('#algorithm').val();
    $('#algorithm-description').text(explanations[selectedAlgorithm]);
}

/**
 * Get the row and column coordinates from a cell's ID
 * @param {HTMLElement} cell - The cell element
 * @returns {Array} Array containing [row, col] coordinates
 */
function getCellCoordinates(cell) {
    return cell.id.split(',').map(Number);
}

/**
 * Start the pathfinding visualization
 */
function startVisualization() {
    if (graphAlgorithm && graphAlgorithm.isRunning) {
        alert("A traversal is already in progress. Please wait.");
        return;
    }

    resetVisitedAndFinal();

    // Initialize or update the algorithm instance
    if (!graphAlgorithm) {
        graphAlgorithm = new GraphAlgorithms(gridArray, startCoord, endCoord);
    } else {
        graphAlgorithm.updateGrid(gridArray);
        graphAlgorithm.setStartPoint(startCoord);
        graphAlgorithm.setEndPoint(endCoord);
    }

    // Execute selected algorithm
    const algorithm = $('#algorithm').val();
    executeAlgorithm(algorithm);
}

/**
 * Execute the selected pathfinding algorithm
 * @param {string} algorithm - The selected algorithm name
 */
async function executeAlgorithm(algorithm) {
    switch (algorithm) {
        case 'a*':
            graphAlgorithm.aStarSearch().then(pathFound => {
                if (!pathFound) graphAlgorithm.noPathFound();
            });
            break;
        case 'dijkstra':
            graphAlgorithm.dijkstraSearch().then(pathFound => {
                if (!pathFound) graphAlgorithm.noPathFound();
            });
            break;
        case 'dfs':
            graphAlgorithm.depthFirstSearch().then(pathFound => {
                if (!pathFound) graphAlgorithm.noPathFound();
            });
            break;
        case 'bfs':
            graphAlgorithm.breadthFirstSearch().then(pathFound => {
                if (!pathFound) graphAlgorithm.noPathFound();
            });
            break;
        default:
            alert("Please select a valid algorithm.");
    }
}

// Utility functions for cell state checking
const isStartPoint = cell => cell.classList.contains('start');
const isEndPoint = cell => cell.classList.contains('end');
const isVisited = cell => cell.classList.contains('visited');
const isObstacle = cell => cell.classList.contains('obstacle');
const isEmpty = cell => cell.className === "cell" && cell.innerHTML === "";

// Utility functions for cell state modification
const markVisited = cell => cell.classList.add("visited");
const markFinalPath = cell => cell.classList.add("final");
const markObstacle = cell => cell.classList.add("obstacle");

/**
 * Reset the entire grid to its initial state
 */
function resetGrid() {
    for (let i = 0; i < gridArray.length; i++) {
        for (let j = 0; j < gridArray[0].length; j++) {
            gridArray[i][j].className = 'cell';
            gridArray[i][j].innerHTML = '';
        }
    }
}

/**
 * Reset only visited and final path cells
 */
function resetVisitedAndFinal() {
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            gridArray[i][j].classList.remove('visited', 'final');
        }
    }
}

// Export all necessary functions and utilities
export {
    createGrid,
    initializeStartEndPoints,
    markVisited,
    markFinalPath,
    isStartPoint,
    isEndPoint,
    isVisited,
    isObstacle,
    isEmpty,
    markObstacle,
    resetGrid
};