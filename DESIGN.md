# Futoshiki initial
- [x] fixed board size 4x4
- [x] hardcoded puzzle without operators
- [x] enable cell digit entry and clear via buttonbar
- [x] enable digit entry via keyboard
- [x] display message when puzzle completed correctly
- [x] restart current puzzle

# Futoshiki basics
- [x] puzzle including operators
- [x] dynamic board size (4x4 .. 9x9)
- [x] add puzzle picker and dynamically load puzzle from server
  - [x] cache puzzles
  - [x] cancel existing pending request when different one comes in
  - [x] ignore when incoming request is same as pending request
  - [x] show download indicator when loading exceeds time threshold
- [x] extra button bar for temporary digits -or- toggle existing bar (caption: draft)
- [ ] undo last move(s)

# Enhancements
- [ ] puzzle selection: leave number empty for random puzzle
- [ ] save game progress in cookie
- [ ] warning when navigating away from page
- [ ] option to track elapsed time
- [ ] auto-cleanup temporary digits on regular digit entry
- [ ] help modes:
  - highlight wrong digit on entry (based on solution -or- rules + highlight conflicts)
  - button to highlight all wrong digits so far
  - button to undo back to first mistake
  - highlght wrong temporary digits (based on rules)
- [ ] learn mode: auto-select all possible numbers in empty cells
- [ ] automated solver
- [ ] print puzzle
- [ ] helptext: game rules and strategies
- [ ] nicer styling when puzzle solved (show button "new random game")
- [ ] nicer styling of button bar
- [ ] replace favicon
- [ ] cleanup README.md

# Links for inspiration
https://sudoku.game/
http://www.sudoku.com/
https://www.sudokukingdom.com/
https://www.websudoku.com/
https://www.nytimes.com/crosswords/game/sudoku/easy
