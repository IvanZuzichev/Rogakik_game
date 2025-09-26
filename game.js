class Game {
    constructor() {
        this.mapWidth = 40;
        this.mapHeight = 24;
        this.tileSize = 50;
        this.map = [];
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.gameOver = false;
        
        this.totalPotions = 10;
        this.totalSwords = 2;
    }

    init() {
        this.generateMap();
        this.render();
        this.setupControls();
        this.startGameLoop();
    }

    generateMap() {
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.map[y][x] = 'W'; 
            }
        }

        const roomCount = Math.floor(Math.random() * 6) + 5; 
        const rooms = [];
        
        for (let i = 0; i < roomCount; i++) {
            const width = Math.floor(Math.random() * 6) + 3; 
            const height = Math.floor(Math.random() * 6) + 3;
            const x = Math.floor(Math.random() * (this.mapWidth - width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.mapHeight - height - 2)) + 1;
            
            rooms.push({ x, y, width, height });
            for (let ry = y; ry < y + height; ry++) {
                for (let rx = x; rx < x + width; rx++) {
                    this.map[ry][rx] = '.';
                }
            }
        }

        this.createCorridors(rooms);
        this.placeItems();
        this.placePlayer();
        this.placeEnemies();
    }

    createCorridors(rooms) {
        const verticalPassages = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < verticalPassages; i++) {
            const x = Math.floor(Math.random() * (this.mapWidth - 2)) + 1;
            for (let y = 0; y < this.mapHeight; y++) {
                this.map[y][x] = '.';
            }
        }

        const horizontalPassages = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < horizontalPassages; i++) {
            const y = Math.floor(Math.random() * (this.mapHeight - 2)) + 1;
            for (let x = 0; x < this.mapWidth; x++) {
                this.map[y][x] = '.';
            }
        }

        rooms.forEach(room => {
            this.connectRoomToPassages(room);
        });
    }

    connectRoomToPassages(room) {
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
        
        directions.forEach(dir => {
            let x = room.x + Math.floor(room.width / 2);
            let y = room.y + Math.floor(room.height / 2);
            
            while (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                if (this.map[y][x] === '.') break;
                this.map[y][x] = '.';
                x += dir.dx;
                y += dir.dy;
            }
        });
    }

    placeItems() {
        for (let i = 0; i < this.totalPotions; i++) {
            const pos = this.getRandomEmptyPosition();
            if (pos) {
                this.items.push({ type: 'HP', x: pos.x, y: pos.y });
            }
        }
        for (let i = 0; i < this.totalSwords; i++) {
            const pos = this.getRandomEmptyPosition();
            if (pos) {
                this.items.push({ type: 'SW', x: pos.x, y: pos.y });
            }
        }
    }

    placePlayer() {
        const pos = this.getRandomEmptyPosition();
        if (pos) {
            this.player = {
                x: pos.x,
                y: pos.y,
                health: 100,
                maxHealth: 100,
                attackPower: 10,
                potions: 0,
                swords: 0
            };
        }
    }

    placeEnemies() {
        for (let i = 0; i < 10; i++) {
            const pos = this.getRandomEmptyPosition();
            if (pos) {
                this.enemies.push({
                    x: pos.x,
                    y: pos.y,
                    health: 30,
                    maxHealth: 30,
                    attackPower: 5,
                    type: 'enemy'
                });
            }
        }
    }

    getRandomEmptyPosition() {
        const emptyPositions = [];
        
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.map[y][x] === '.' && 
                    !this.isPositionOccupied(x, y)) {
                    emptyPositions.push({ x, y });
                }
            }
        }
        
        return emptyPositions.length > 0 ? 
            emptyPositions[Math.floor(Math.random() * emptyPositions.length)] : 
            null;
    }

    isPositionOccupied(x, y) {
        if (this.player && this.player.x === x && this.player.y === y) {
            return true;
        }
        
        if (this.enemies.some(enemy => enemy.x === x && enemy.y === y)) {
            return true;
        }
        
        if (this.items.some(item => item.x === x && item.y === y)) {
            return true;
        }
        
        return false;
    }

    render() {
        const $field = $('.field');
        $field.empty();
        $field.width(this.mapWidth * this.tileSize);
        $field.height(this.mapHeight * this.tileSize);

        // Отрисовка карты
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileType = this.map[y][x];
                const $tile = $('<div class="tile"></div>');
                $tile.css({
                    left: x * this.tileSize,
                    top: y * this.tileSize
                });
                
                if (tileType === 'W') {
                    $tile.addClass('tileW');
                }
                
                $field.append($tile);
            }
        }

        // Отрисовка предметов
        this.items.forEach(item => {
            const $item = $('<div class="tile"></div>');
            $item.css({
                left: item.x * this.tileSize,
                top: item.y * this.tileSize
            });
            $item.addClass(item.type === 'HP' ? 'tileHP' : 'tileSW');
            $field.append($item);
        });

        // Отрисовка врагов
        this.enemies.forEach(enemy => {
            const $enemy = $('<div class="tile tileE"></div>');
            $enemy.css({
                left: enemy.x * this.tileSize,
                top: enemy.y * this.tileSize
            });
            
            const $health = $('<div class="health"></div>');
            $health.css('width', (enemy.health / enemy.maxHealth) * 100 + '%');
            $enemy.append($health);
            
            $field.append($enemy);
        });

        // Отрисовка игрока
        if (this.player) {
            const $player = $('<div class="tile tileP"></div>');
            $player.css({
                left: this.player.x * this.tileSize,
                top: this.player.y * this.tileSize
            });
            
            const $health = $('<div class="health"></div>');
            $health.css('width', (this.player.health / this.player.maxHealth) * 100 + '%');
            $player.append($health);
            
            $field.append($player);
        }

        this.updateInfoPanel();
    }

    updateInfoPanel() {
        if (this.player) {
            $('#health').text(this.player.health);
            $('#attack-power').text(this.player.attackPower);
            $('#potions').text(this.player.potions);
            $('#swords').text(this.player.swords);
        }
    }

    setupControls() {
        $(document).keydown((e) => {
            if (this.gameOver) return;

            switch(e.key.toLowerCase()) {
                case 'w': this.movePlayer(0, -1); break;
                case 'a': this.movePlayer(-1, 0); break;
                case 's': this.movePlayer(0, 1); break;
                case 'd': this.movePlayer(1, 0); break;
                case ' ': this.attack(); break;
            }
        });
    }

    movePlayer(dx, dy) {
        if (!this.player) return;

        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX < 0 || newX >= this.mapWidth || 
            newY < 0 || newY >= this.mapHeight || 
            this.map[newY][newX] === 'W') {
            return;
        }

        // Проверяем, не занята ли клетка врагом
        const enemyAtPosition = this.enemies.find(enemy => 
            enemy.x === newX && enemy.y === newY
        );
        
        if (enemyAtPosition) {
            // Атакуем врага при движении на его клетку
            this.attackEnemy(enemyAtPosition);
            return;
        }

        this.player.x = newX;
        this.player.y = newY;
        this.checkItemCollection();
        this.checkEnemyAttack();
        this.render();
        this.checkWinCondition();
    }

    attack() {
        if (!this.player) return;

        // Атакуем всех соседних врагов
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, 
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];

        let attacked = false;

        directions.forEach(dir => {
            const attackX = this.player.x + dir.dx;
            const attackY = this.player.y + dir.dy;

            const enemyIndex = this.enemies.findIndex(enemy => 
                enemy.x === attackX && enemy.y === attackY
            );

            if (enemyIndex !== -1) {
                this.attackEnemy(this.enemies[enemyIndex]);
                attacked = true;
            }
        });

        if (attacked) {
            this.render();
            this.checkGameOver();
            this.checkWinCondition();
        }
    }

    attackEnemy(enemy) {
        // Наносим урон врагу
        enemy.health -= this.player.attackPower;
        
        // Проверяем, убит ли враг
        if (enemy.health <= 0) {
            const enemyIndex = this.enemies.indexOf(enemy);
            if (enemyIndex !== -1) {
                this.enemies.splice(enemyIndex, 1);
            }
        }
    }

    checkItemCollection() {
        const itemIndex = this.items.findIndex(item => 
            item.x === this.player.x && item.y === this.player.y
        );

        if (itemIndex !== -1) {
            const item = this.items[itemIndex];
            
            if (item.type === 'HP') {
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 20);
                this.player.potions++;
            } else if (item.type === 'SW') {
                this.player.attackPower += 5;
                this.player.swords++;
            }
            
            this.items.splice(itemIndex, 1);
            this.checkWinCondition();
        }
    }

    checkWinCondition() {
        if (this.player.potions >= this.totalPotions && 
            this.player.swords >= this.totalSwords && 
            this.enemies.length === 0) {
            
            this.gameOver = true;
            alert('ПОБЕДА! Вы собрали все предметы и уничтожили всех врагов! Идеальная победа!');
            return true;
        }
        return false;
    }

    checkEnemyAttack() {
        this.enemies.forEach(enemy => {
            const distance = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
            if (distance === 1) {
                this.player.health -= enemy.attackPower;
                this.checkGameOver();
            }
        });
    }

    moveEnemies() {
        this.enemies.forEach(enemy => {
            // Враги преследуют игрока
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            
            let moveX = 0;
            let moveY = 0;
            
            // Случайное движение или преследование
            if (Math.random() > 0.5) {
                // Преследование игрока
                if (Math.abs(dx) > Math.abs(dy)) {
                    moveX = dx > 0 ? 1 : -1;
                } else {
                    moveY = dy > 0 ? 1 : -1;
                }
            } else {
                // Случайное движение
                const directions = [
                    { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, 
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
                ];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                moveX = randomDir.dx;
                moveY = randomDir.dy;
            }

            const newX = enemy.x + moveX;
            const newY = enemy.y + moveY;

            // Проверяем возможность движения
            if (newX >= 0 && newX < this.mapWidth && 
                newY >= 0 && newY < this.mapHeight && 
                this.map[newY][newX] !== 'W' && 
                !this.isPositionOccupiedByOtherEnemy(newX, newY, enemy) &&
                !(newX === this.player.x && newY === this.player.y)) {
                
                enemy.x = newX;
                enemy.y = newY;
            }
        });

        this.checkEnemyAttack();
    }

    isPositionOccupiedByOtherEnemy(x, y, currentEnemy) {
        return this.enemies.some(enemy => 
            enemy !== currentEnemy && enemy.x === x && enemy.y === y
        );
    }

    startGameLoop() {
        setInterval(() => {
            if (!this.gameOver) {
                this.moveEnemies();
                this.render();
                this.checkGameOver();
                this.checkWinCondition();
            }
        }, 1000);
    }

    checkGameOver() {
        if (this.player && this.player.health <= 0) {
            this.gameOver = true;
            alert('Игра окончена! Вы проиграли.');
        }
    }
}

$(document).ready(() => {
    const game = new Game();
    game.init();
});