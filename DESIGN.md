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
- [x] extra button bar for candidate digits
- [x] undo last move(s)

# Enhancements
- [x] puzzle selection: pick a random puzzle
- [x] save game progress in cookie
- [x] print puzzle
- [x] add support for Internet Explorer
- [x] replace favicon
- [x] auto-cleanup candidates on regular digit entry
- [x] nicer styling when puzzle solved (show button "new random game")
- [x] block invalid (based on rules) digit entry; highlight related cells
- [x] block invalid (based on rules) candidate digit entry; highlight related cells
- [x] move `Promote` button from debug mode into normal game
- [x] move `Undo` into button bar and enable Ctrl+Z shortcut
- [x] nicer styling of button bar
  - [x] move `Restart`, `New game`, `Change puzzle`, `Settings` behind hamburger menu
  - [x] controls left: `Undo`, `Promote`, `Hint`
- [x] `Hint` button (unrelated to selection)
  - [x] basic solver strategies (http://hodoku.sourceforge.net/en/tech_hidden.php, http://pzl.org.uk/futoshiki.html)
    - [x] Set candidates in empty cells
    - [x] Promote all single candidates
    - [x] Naked Singles
    - [x] Hidden Singles
    - [x] Operators
    - [x] Naked Pairs/Triples
    - [x] Hidden Pairs/Triples
    - [x] Naked Quads
  - [x] add setting to display hint explanations
    - [x] update settings modal and store in cookie
    - [x] add closable textblock to contain explanations
    - [x] move buttons from debug mode into normal game
    - [x] display coordinate rulers
  - [x] write scanner to find matching puzzles
    - [x] create unit tests for strategies
- [x] `?` button
  - Same as `Hint` button, but apply only for selected cell
- [ ] code refactorings and cleanup
  - [ ] validate inputs in class members
  - [x] split parsing and rendering of downloaded puzzle in BoardComponent
  - [x] extract undo tracking into separate class
  - [ ] review components and extract non-UI logic into separate classes
  - [x] switch to TypeScript strict mode
  - [x] replace number arrays with read-only sets
- [ ] option to track elapsed time
- [x] add menu option to show game rules and strategies
- [ ] cleanup README.md
- [ ] consider to use "prettier" code-formatter
- [ ] optimize performance
  - [ ] try table layout instead of divs for board
  - [ ] replace storage of cell/candidate values with bitmask
- [ ] have some automated (unit) tests (using real puzzles)
- [ ] additional solver strategies (http://www.sudokuwiki.org)

# Links for inspiration
https://sudoku.game/
http://www.sudoku.com/
https://www.sudokukingdom.com/
https://www.websudoku.com/
https://www.nytimes.com/crosswords/game/sudoku/easy
