# Pathfinding Algorithm Visualizer

A simple interactive tool to visualize how different pathfinding algorithms work in real-time.

## Features

- Visualize 4 popular pathfinding algorithms:
  - A* (A-Star): Best for finding shortest path quickly
  - Dijkstra's: Explores in all directions
  - BFS (Breadth-First Search): Explores level by level
  - DFS (Depth-First Search): Explores one path at a time

## How to Use

1. **Set Up the Grid**
   - Click and drag to draw walls (black)
   - Move start point (green) and end point (red)

2. **Run Algorithm**
   - Select an algorithm from the dropdown
   - Click "Start" to watch it work
   - Use speed slider to adjust visualization speed

3. **Controls**
   - Clear Path: Removes the current path
   - Clear Board: Resets everything
   - Stop: Halts the current visualization

## Colors Guide
- White: Empty cell
- Black: Wall
- Blue: Start point
- Red: End point
- Green: Visited cells
- Yellow: Final path

## Technical Notes
- Built with JavaScript
- Uses async/await for smooth animations
- Grid-based movement (no diagonals)


## READ
run it with https-server to avoid CORS error