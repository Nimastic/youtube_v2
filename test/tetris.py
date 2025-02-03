import random
import curses
import time

# Initialize the shapes of Tetris pieces
SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 1]]
]

# Initialize constants
BOARD_WIDTH = 10
BOARD_HEIGHT = 20
TICK_RATE = 0.3

class Tetris:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.board = [[0] * BOARD_WIDTH for _ in range(BOARD_HEIGHT)]
        self.current_piece = None
        self.piece_x, self.piece_y = 0, 0
        self.next_piece()
        self.score = 0
        self.game_over = False

    def next_piece(self):
        """Create the next random piece."""
        self.current_piece = random.choice(SHAPES)
        self.piece_x, self.piece_y = BOARD_WIDTH // 2 - len(self.current_piece[0]) // 2, 0

    def rotate_piece(self):
        """Rotate the current piece."""
        rotated = list(zip(*self.current_piece[::-1]))
        if not self.collision(rotated, self.piece_x, self.piece_y):
            self.current_piece = rotated

    def collision(self, piece, x, y):
        """Check for collision with board boundaries or other pieces."""
        for i, row in enumerate(piece):
            for j, cell in enumerate(row):
                if cell and (y + i >= BOARD_HEIGHT or x + j < 0 or x + j >= BOARD_WIDTH or self.board[y + i][x + j]):
                    return True
        return False

    def merge_piece(self):
        """Merge the piece into the board and clear lines if possible."""
        for i, row in enumerate(self.current_piece):
            for j, cell in enumerate(row):
                if cell:
                    self.board[self.piece_y + i][self.piece_x + j] = 1
        self.clear_lines()
        self.next_piece()
        if self.collision(self.current_piece, self.piece_x, self.piece_y):
            self.game_over = True

    def clear_lines(self):
        """Clear completed lines and increase the score."""
        new_board = [row for row in self.board if any(cell == 0 for cell in row)]
        lines_cleared = BOARD_HEIGHT - len(new_board)
        self.board = [[0] * BOARD_WIDTH for _ in range(lines_cleared)] + new_board
        self.score += lines_cleared * 100

    def move(self, dx, dy):
        """Move the piece if possible."""
        if not self.collision(self.current_piece, self.piece_x + dx, self.piece_y + dy):
            self.piece_x += dx
            self.piece_y += dy
            return True
        return False

    def draw_board(self):
        """Draw the board and current piece."""
        for y, row in enumerate(self.board):
            for x, cell in enumerate(row):
                self.stdscr.addstr(y, x * 2, "[]" if cell else "  ")
        for i, row in enumerate(self.current_piece):
            for j, cell in enumerate(row):
                if cell:
                    self.stdscr.addstr(self.piece_y + i, (self.piece_x + j) * 2, "[]")

        self.stdscr.addstr(0, BOARD_WIDTH * 2 + 5, f"Score: {self.score}")

    def run(self):
        """Run the game loop."""
        last_time = time.time()
        while not self.game_over:
            self.stdscr.clear()
            self.draw_board()
            self.stdscr.refresh()

            # Input handling
            key = self.stdscr.getch()
            if key == curses.KEY_LEFT:
                self.move(-1, 0)
            elif key == curses.KEY_RIGHT:
                self.move(1, 0)
            elif key == curses.KEY_DOWN:
                self.move(0, 1)
            elif key == ord(' '):
                self.rotate_piece()

            # Move down automatically
            if time.time() - last_time > TICK_RATE:
                if not self.move(0, 1):
                    self.merge_piece()
                last_time = time.time()

        # Game over screen
        self.stdscr.clear()
        self.stdscr.addstr(BOARD_HEIGHT // 2, BOARD_WIDTH * 2 // 2 - 5, "Game Over")
        self.stdscr.addstr(BOARD_HEIGHT // 2 + 1, BOARD_WIDTH * 2 // 2 - 5, f"Score: {self.score}")
        self.stdscr.refresh()
        self.stdscr.getch()

def main(stdscr):
    curses.curs_set(0)
    stdscr.nodelay(1)
    stdscr.timeout(100)
    tetris = Tetris(stdscr)
    tetris.run()

curses.wrapper(main)
