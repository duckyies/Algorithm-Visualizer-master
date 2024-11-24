import {markVisited, markFinalPath, isVisited, isObstacle, resetGrid} from './Graph.js';

class PathFinder {
    /**
     * Initialize the pathfinding algorithm with a grid and start/end points
     * @param {Array<Array>} grid - 2D array representing the grid
     * @param {Array} startPoint - Starting coordinates [row, col]
     * @param {Array} endPoint - Ending coordinates [row, col]
     */
    constructor(grid, startPoint, endPoint) {
        this.grid = grid;                 // Store the grid structure
        this.startPoint = startPoint;     // Store starting coordinates
        this.endPoint = endPoint;         // Store ending coordinates
        this.isRunning = false;           // Flag to track if algorithm is running
    }

    /**
     * Update the start point coordinates
     * @param {Array} newStart - New starting coordinates [row, col]
     */
    setStartPoint(newStart) {
        this.startPoint = newStart;
    }

    /**
     * Update the end point coordinates
     * @param {Array} newEnd - New ending coordinates [row, col]
     */
    setEndPoint(newEnd) {
        this.endPoint = newEnd;
    }

    /**
     * Update the grid structure
     * @param {Array<Array>} newGrid - New 2D grid structure
     */
    updateGrid(newGrid) {
        this.grid = newGrid;
    }

    /**
 * A* pathfinding algorithm implementation
 */
async aStarSearch() { 
    this.isRunning = true;
    const startPoint = this.startPoint;
    const endPoint = this.endPoint;
    const grid = this.grid;
    
    // Initialize open and closed sets using string representations of coordinates
    const openSet = new Set([JSON.stringify([startPoint[0], startPoint[1]])]);
    const closedSet = new Set();
    
    // Initialize cost arrays and parent tracking
    const gCosts = [];    // Cost from start to current node
    const fCosts = [];    // Total estimated cost (g + h)
    const parentNodes = [];
    
    // Initialize the cost arrays with maximum values
    for(let row = 0; row < grid.length; row++) {
        const gRow = [];
        const fRow = [];
        const parentRow = [];
        for(let col = 0; col < grid[0].length; col++) {
            gRow.push(Number.MAX_VALUE);  // Initialize g-cost with infinity
            fRow.push(Number.MAX_VALUE);  // Initialize f-cost with infinity
            parentRow.push([-1, -1]);     // Initialize parent coordinates with invalid value
        }
        gCosts.push(gRow);
        fCosts.push(fRow);
        parentNodes.push(parentRow);
    }

    // Initialize start node costs
    gCosts[startPoint[0]][startPoint[1]] = 0;
    fCosts[startPoint[0]][startPoint[1]] = await calculateHeuristic(startPoint[0], startPoint[1]);
    parentNodes[startPoint[0]][startPoint[1]] = [startPoint[0], startPoint[1]];

    /**
     * Find node with minimum f-cost in the open set
     */
    async function findMinCostNode() {
        let minFCost = Number.MAX_VALUE;
        let minRow = undefined;
        let minCol = undefined;

        openSet.forEach(node => { 
            const [row, col] = JSON.parse(node);
            if(minFCost > fCosts[row][col]) {
                minRow = row;
                minCol = col;
                minFCost = fCosts[row][col];
            }
        });
        return [minRow, minCol];
    }
    
    /**
     * Update neighboring nodes in the open set
     */
    async function processNeighbors(row, col) {
        // Direction offsets for 4-directional movement (right, down, left, up)
        const directions = [1, 0, -1, 0, 1];
        
        for(let i = 0; i < 4; i++) {
            const newRow = row + directions[i];
            const newCol = col + directions[i + 1];
            
            // Check if neighbor is valid and not in closed set
            if(newRow >= 0 && newRow < grid.length && 
               newCol >= 0 && newCol < grid[0].length && 
               !closedSet.has(JSON.stringify([newRow, newCol])) && 
               !isObstacle(grid[newRow][newCol])) {
                
                // Calculate new g-cost to this neighbor
                const newGCost = gCosts[row][col] + 1;
                
                // Update costs if we found a better path
                if(gCosts[newRow][newCol] > newGCost) {
                    gCosts[newRow][newCol] = newGCost;
                    fCosts[newRow][newCol] = newGCost + await calculateHeuristic(newRow, newCol);
                    parentNodes[newRow][newCol] = [row, col];
                }
                
                // Add to open set if not already included
                if(!openSet.has(JSON.stringify([newRow, newCol]))) {
                    openSet.add(JSON.stringify([newRow, newCol]));
                    markVisited(grid[newRow][newCol]);
                }
            }
        }
    }
    
    /**
     * Calculate Manhattan distance heuristic
     */
    function calculateHeuristic(row, col) {
        return Math.abs(row - endPoint[0]) + Math.abs(col - endPoint[1]);
    }

    // Main A* algorithm loop
    let currentNode = undefined;
    let currentRow = startPoint[0];
    let currentCol = startPoint[1];
    
    while(openSet.size > 0 && currentNode != grid[endPoint[0]][endPoint[1]]) { 
        await delay(0.1);  // Add small delay for visualization
        
        // Get the node with minimum f-cost
        const [minRow, minCol] = await findMinCostNode();
        currentRow = minRow;
        currentCol = minCol;
        currentNode = grid[minRow][minCol];
        
        // Move current node from open to closed set
        openSet.delete(JSON.stringify([minRow, minCol]));
        closedSet.add(JSON.stringify([minRow, minCol]));
        
        // Process all neighboring nodes
        await processNeighbors(minRow, minCol);
    }
    
    // Trace path if end was reached, otherwise show error
    currentNode == grid[endPoint[0]][endPoint[1]] 
        ? await this.reconstructPath(parentNodes) 
        : alert('No path exists :(');
    
    this.isRunning = false;
}

/**
 * Depth-First Search implementation for pathfinding
 */
async depthFirstSearch() {
    this.isRunning = true;
    const startPoint = this.startPoint;
    const endPoint = this.endPoint;
    const grid = this.grid;
    
    // Direction offsets for 4-directional movement (right, down, left, up)
    const directions = [1, 0, -1, 0, 1];
    const pathFound = [];  // Store the successful path coordinates
    
    /**
     * Recursive DFS implementation
     * @param {number} row - Current row coordinate
     * @param {number} col - Current column coordinate
     * @returns {boolean} - True if path is found, false otherwise
     */
    async function dfsRecursive(row, col) {
        // Check boundary conditions, obstacles, and visited cells
        if (row < 0 || row >= grid.length || 
            col < 0 || col >= grid[0].length || 
            await isObstacle(grid[row][col]) || 
            await isVisited(grid[row][col])) {
            return false;
        }
        
        // Check if we reached the destination
        if (row == endPoint[0] && col == endPoint[1]) {
            pathFound.push([row, col]);
            return true;
        }
        
        // Mark current cell as visited
        await markVisited(grid[row][col]);
        
        // Explore all four directions
        for (let i = 0; i < 4; i++) {
            await delay(7);  // Add delay for visualization
            
            // Check next position in current direction
            if (await dfsRecursive(
                row + directions[i],
                col + directions[i + 1]
            )) {
                pathFound.push([row, col]);
                return true;
            }
        }
        
        return false;
    }
    
    // Start DFS from the starting point
    const pathExists = await dfsRecursive(startPoint[0], startPoint[1]);
    
    // If path exists, visualize it, otherwise show error
    pathExists 
        ? await this.visualizePathFromArray(pathFound) 
        : alert('No path exists :(');
    
    this.isRunning = false;
}

/**
 * Breadth-First Search implementation for pathfinding
 */
async breadthFirstSearch() {
    this.isRunning = true;
    const startPoint = this.startPoint;
    const endPoint = this.endPoint;
    const grid = this.grid;
    
    // Initialize parent array to track path
    const parentNodes = [];
    for (let i = 0; i < grid.length; i++) {
        const parentRow = [];
        for (let j = 0; j < grid[0].length; j++) {
            parentRow.push([-1, -1]);
        }
        parentNodes.push(parentRow);
    }
    
    // Set parent of start node to itself
    parentNodes[startPoint[0]][startPoint[1]] = [startPoint[0], startPoint[1]];
    
    /**
     * BFS implementation using queue
     * @returns {boolean} - True if path is found, false otherwise
     */
    async function bfsImplementation() {
        const queue = [];  // Initialize queue for BFS
        const directions = [1, 0, -1, 0, 1];  // Direction offsets
        
        // Add start point to queue
        queue.push([startPoint[0], startPoint[1]]);
        
        while (queue.length > 0) {
            await delay(50);  // Add delay for visualization
            
            const currentLevelSize = queue.length;
            // Process all nodes at current level
            for (let x = 0; x < currentLevelSize; x++) {
                // Check if we reached the destination
                if (queue[0][0] == endPoint[0] && queue[0][1] == endPoint[1]) {
                    return true;
                }
                
                const [currentRow, currentCol] = queue[0];
                queue.shift();  // Remove processed node
                
                // Explore all four directions
                for (let i = 0; i < 4; i++) {
                    const neighborRow = currentRow + directions[i];
                    const neighborCol = currentCol + directions[i + 1];
                    
                    // Check if neighbor is valid and unexplored
                    if (neighborRow >= 0 && neighborRow < grid.length && 
                        neighborCol >= 0 && neighborCol < grid[0].length && 
                        !isObstacle(grid[neighborRow][neighborCol]) && 
                        !isVisited(grid[neighborRow][neighborCol])) {
                        
                        // Update parent of neighbor
                        parentNodes[neighborRow][neighborCol] = [currentRow, currentCol];
                        
                        // Check if we reached the destination
                        if (neighborRow == endPoint[0] && neighborCol == endPoint[1]) {
                            return true;
                        }
                        
                        // Add neighbor to queue and mark as visited
                        queue.push([neighborRow, neighborCol]);
                        markVisited(grid[neighborRow][neighborCol]);
                    }
                }
            }
        }
        return false;
    }
    
    // Start BFS and handle result
    const pathExists = await bfsImplementation();
    pathExists 
        ? await this.reconstructPath(parentNodes) 
        : alert('No path exists :(');
    
    this.isRunning = false;
}
/**
 * Dijkstra's algorithm implementation for pathfinding
 */
async dijkstraSearch() {
    this.isRunning = true;
    
    const startPoint = this.startPoint;
    const endPoint = this.endPoint;
    const grid = this.grid;
    
    // Initialize distance and parent arrays
    const distances = [];
    const parentNodes = [];
    
    // Initialize arrays with infinity distances and no parents
    for (let i = 0; i < grid.length; i++) {
        const distanceRow = [];
        const parentRow = [];
        for (let j = 0; j < grid[0].length; j++) {
            distanceRow.push(Number.MAX_VALUE);
            parentRow.push([-1, -1]);
        }
        distances.push(distanceRow);
        parentNodes.push(parentRow);
    }
    
    // Set start point distance to 0 and parent to itself
    distances[startPoint[0]][startPoint[1]] = 0;
    parentNodes[startPoint[0]][startPoint[1]] = [startPoint[0], startPoint[1]];
    
    /**
     * Get the node with minimum distance from priority queue
     * @param {Set} priorityQueue - Set of nodes to consider
     * @returns {Array} - Coordinates of node with minimum distance
     */
    function getMinDistanceNode(priorityQueue) {
        let minDistance = Number.MAX_VALUE;
        let minRow = -1;
        let minCol = -1;
        
        priorityQueue.forEach(nodeStr => {
            const [row, col] = JSON.parse(nodeStr);
            if (minDistance > distances[row][col]) {
                minDistance = distances[row][col];
                minRow = row;
                minCol = col;
            }
        });
        
        // Remove selected node from queue
        priorityQueue.delete(JSON.stringify([minRow, minCol]));
        return [minRow, minCol];
    }
    
    /**
     * Main Dijkstra's algorithm implementation
     * @returns {boolean} - True if path is found, false otherwise
     */
    async function dijkstraImplementation() {
        const priorityQueue = new Set();
        // Add start point to queue
        priorityQueue.add(JSON.stringify([startPoint[0], startPoint[1]]));
        
        // Direction offsets for 4-directional movement (right, down, left, up)
        const directions = [1, 0, -1, 0, 1];
        
        while (priorityQueue.size) {
            await delay(1);  // Add small delay for visualization
            
            // Get node with minimum distance
            const [currentRow, currentCol] = getMinDistanceNode(priorityQueue);
            
            // Check if we reached the destination
            if (currentRow === endPoint[0] && currentCol === endPoint[1]) {
                return true;
            }
            
            // Explore all four directions
            for (let i = 0; i < 4; i++) {
                const neighborRow = currentRow + directions[i];
                const neighborCol = currentCol + directions[i + 1];
                
                // Check if neighbor is valid
                if (neighborRow >= 0 && neighborRow < grid.length && 
                    neighborCol >= 0 && neighborCol < grid[0].length && 
                    !isObstacle(grid[neighborRow][neighborCol])) {
                    
                    // If we found the destination, update parent and return
                    if (neighborRow === endPoint[0] && neighborCol === endPoint[1]) {
                        parentNodes[neighborRow][neighborCol] = [currentRow, currentCol];
                        return true;
                    }
                    
                    // Calculate new distance to neighbor
                    const newDistance = distances[currentRow][currentCol] + 1;
                    
                    // Update distance if we found a shorter path
                    if (!isVisited(grid[neighborRow][neighborCol]) || 
                        distances[neighborRow][neighborCol] > newDistance) {
                        
                        distances[neighborRow][neighborCol] = newDistance;
                        parentNodes[neighborRow][neighborCol] = [currentRow, currentCol];
                        priorityQueue.add(JSON.stringify([neighborRow, neighborCol]));
                        markVisited(grid[neighborRow][neighborCol]);
                    }
                }
            }
        }
        return false;
    }
    
    // Start Dijkstra's algorithm and handle result
    const pathExists = await dijkstraImplementation();
    pathExists 
        ? await this.reconstructPath(parentNodes) 
        : alert('No path exists :(');
    
    this.isRunning = false;
}

/**
 * Visualize the path found by pathfinding algorithms
 * @param {Array} path - Array of coordinates representing the path
 */
async visualizePathFromArray(path) {
    resetGrid(isVisited);
    for (let i = 0; i < path.length; i++) {
        await delay(20);
        markFinalPath(this.grid[path[i][0]][path[i][1]]);
    }
}

/**
 * Reconstruct and visualize path using parent nodes
 * @param {Array} parentNodes - 2D array of parent coordinates
 */
async reconstructPath(parentNodes) {
    const path = [];
    let current = this.endPoint;

    // Reconstruct path from end to start
    while (current[0] !== this.startPoint[0] || current[1] !== this.startPoint[1]) {
        path.unshift(current);
        current = parentNodes[current[0]][current[1]];
    }
    path.unshift(this.startPoint);

    // Visualize the path
    for (let i = 0; i < path.length; i++) {
        await delay(20);
        markFinalPath(this.grid[path[i][0]][path[i][1]]);
    }
    return true;
}

/**
 * Handle case when no path is found
 */
async noPathFound() {
    // Color all non-obstacle cells orange
    for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[0].length; j++) {
            const cell = this.grid[i][j];
            if (!isObstacle(cell) && !isSrc(cell) && !isDest(cell)) {
                cell.style.backgroundColor = '#FFA500';
                await delay(5);
            }
        }
    }

    // Show alert after visualization
    setTimeout(() => {
        alert("No path exists!");
    }, 100);
}

}

// Utility function for adding delays in async operations
async function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export default PathFinder;