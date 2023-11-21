const Game = {
	canvas: null,
	ctx: null,

	// ticks per second
	tps: 1,
	_tick: 1, 

	empty_color: '#cccccc',

	world_width: 40,
	world_height: 40,

	cell_width: 16,
	cell_height: 16,
	cells: [],

	mouse: null,

	hover_cell: null,

	// game state
	state: 1, // 1: ready, 2: running, 4: paused
	logic: [],

	// set game state functions
	run: function() {
		Game.state = 2;
	},

	pause: function() {
		Game.state = 4;
	},

	reset: function() {
		Game.cells = [];
		Game.init();
		Game.state = 1;
	},

	// run a step of physics, based on state
	run_tick: function() {
		Game._tick++;

		if ( Game.state === 2 ) {
			Game.one_tick();
		}
		
		Game.render();
	},

	one_tick: function() {
		if ( Game.logic.length ) {
			for ( let i = 0; i < Game.logic.length; ++i ) {
				Game.logic[i]();
			}
		}
	},

	render: function() {
		//console.log('Rendering');
		const width = this.cell_width;
		const height = this.cell_height;
		const w_skip = width + 2;
		const h_skip = height + 2;
		Game.ctx.fillStyle = '#aa7777';
		Game.ctx.clearRect(0,0,(this.world_width * w_skip)+ 128,(this.world_height * h_skip) + 128);
		Game.ctx.fillRect(0,0,(this.world_width * w_skip) + 128,(this.world_height * h_skip) + 128);
	
		Game.render_debug();

		for ( let x = 0; x < this.world_width; ++x ) {
			for ( let y = 0; y < this.world_height; ++y ) {
				if ( this.hover_cell && this.hover_cell.x === x && this.hover_cell.y === y ) {
					Game.ctx.fillStyle = '#ffff99';
					Game.ctx.fillRect(x * w_skip - 2, y * h_skip - 2, w_skip + 2, h_skip + 2);
				}
				Game.ctx.fillStyle = CellColors[this.cells[x][y].state];
				Game.ctx.fillRect(x * w_skip, y * h_skip, width, height);

				if ( this.cells[x][y].text ) {
					Game.ctx.textAlign = 'center';
					Game.ctx.textBaseline = 'middle';
					Game.ctx.font = '10px serif';
					Game.ctx.fillStyle = '#000000';
					Game.ctx.fillText(
						this.cells[x][y].text,
						x * w_skip + (Game.cell_width / 2),
						y * h_skip + (Game.cell_height / 2)
					); 
				}
			}
		}
	},

	render_debug: function() {
		Game.ctx.textAlign = 'center';
		Game.ctx.textBaseline = 'middle';
		Game.ctx.font = '10px serif';
		Game.ctx.fillStyle = '#000000';
		Game.ctx.fillText(
			`Frame: ${Game._tick}`,
			((Game.cell_width + 2) * Game.world_width) + 48,
			20
		); 
	},

	init: function() {
		const w_skip = this.cell_width + 2;
		const h_skip = this.cell_height + 2;
		Game.ctx.fillStyle = '#cfcfcf';
		Game.ctx.fillRect(0,0,(this.world_width * w_skip),(this.world_height * h_skip));
		for ( let x = 0; x < this.world_width; ++x ) {
			this.cells.push([]);

			for ( let y = 0; y < this.world_height; ++y ) {
				this.cells[x].push( new Cell(x, y, this.empty_color) );
			}
		}
	},

	mouse_down: function(ev) {
		Game.mouse = 'button';

		Game.change_cell(ev);
	},
	mouse_up: function(_ev) {
		Game.mouse = null;

		Game.render();
	},

	handle_hover: function(ev) {
		const cell = Game.mouse_to_cell(ev);
		if ( Game.hover_cell === cell ) {
			return;
		}

		Game.hover_cell = cell;

		if ( Game.mouse ) {
			Game.change_cell(ev);
		}

		Game.render();
	},

	change_cell: function(ev) {
		const cell = Game.mouse_to_cell(ev);
		if ( cell.state === 'alive' ) {
			cell.state = 'dead';
		//} else if ( cell.state === 'alive' ) {
		//	cell.state = 'dying';
		//} else if ( cell.state === 'dying' ) {
		//	cell.state = 'dead';
		}

		Game.render();

	},

	mouse_to_cell: function(ev) { 
		const x = Math.floor(ev.clientX / (Game.cell_width + 2));
		const y = Math.floor(ev.clientY / (Game.cell_width + 2));
		if ( x in Game.cells && y in Game.cells[x] ) {
			//console.log(`x: ${x}, y: ${y}`);
			return Game.cells[x][y];
		}
		return { x: x, y: y };
	},

};

const CellColors = {
	new: Game.empty_color,
	alive: '#77aa77',
	dead: '#773333',
};

function Cell(x, y, color) {
	this.type = 'cell';
	this.hover = false;
	this.x = x;
	this.y = y;
	this.state = 'alive';

	this.color = color;

	this.text = 15;
}

document.addEventListener('DOMContentLoaded', () => {
	document.addEventListener('mousedown', Game.mouse_down);
	document.addEventListener('mouseup', Game.mouse_up);
	document.addEventListener('mousemove', Game.handle_hover);

	Game.canvas = document.getElementById('world');
	Game.ctx = Game.canvas.getContext('2d');

	const width = 128 + (Game.world_width * (Game.cell_width + 2));
	const height = (Game.world_height * (Game.cell_height + 2));

	Game.canvas.style.width = width + 'px';
	Game.canvas.style.height = height + 'px';
	Game.canvas.width = width;
	Game.canvas.height = height;

	Game.init();
	Game.render();

	setInterval(Game.run_tick, Game.tps * 1000);
});
