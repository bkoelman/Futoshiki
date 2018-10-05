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
- [x] extra button bar for draft digits
- [x] undo last move(s)

# Enhancements
- [x] puzzle selection: pick a random puzzle
- [x] save game progress in cookie
- [x] print puzzle
- [x] add support for Internet Explorer
- [x] replace favicon
- [x] auto-cleanup draft digits on regular digit entry
- [ ] nicer styling when puzzle solved (show button "new random game")
- [ ] display coordinate rulers
- [x] block invalid (based on rules) digit entry; highlight related cells
- [x] block invalid (based on rules) draft digit entry; highlight related cells
- [ ] move `Promote` button from debug mode into normal game
- [ ] code refactorings and cleanup
  - [ ] validate inputs in class members
  - [x] split parsing and rendering of downloaded puzzle in BoardComponent
  - [ ] move classes into subfolder 'logic' / maybe change into services?
  - [x] extract undo tracking into separate class
  - [ ] review components and extract non-UI logic into separate classes
  - [x] switch to TypeScript strict mode
- [ ] learn mode: auto-select all possible numbers in empty cells
- [ ] automated solver (http://pzl.org.uk/futoshiki.html)
  - [x] Naked Set
  - [ ] Naked Triples/Quads with subsets
  - [x] Hidden Set
  - [ ] Hidden Triples/Quads with subsets
  - [x] Relative Size (Single)
  - [x] Relative Size (Double) (http://www.davdata.nl/futoshiki.html point 4)
  - [ ] X-Wing
  - .... see http://www.sudokuwiki.org
- [ ] option to track elapsed time
- [ ] helptext: game rules and strategies
- [ ] move Undo into button bar and enable Ctrl+Z shortcut
- [ ] nicer styling of button bar
  - [ ] move `Restart`, `Change puzzle`, `Settings` behind hamburger menu
  - [ ] move to side, depending on screen size (https://davidwalsh.name/orientation-change)
- [ ] cleanup README.md
- [ ] consider to use "prettier" code-formatter
- [ ] optimize performance
  - [ ] try table layout instead of divs for board
  - [ ] replace storage of cell/draft values with bitmask
- [ ] have some automated (unit) tests (using real puzzles)

# Links for inspiration
https://sudoku.game/
http://www.sudoku.com/
https://www.sudokukingdom.com/
https://www.websudoku.com/
https://www.nytimes.com/crosswords/game/sudoku/easy
