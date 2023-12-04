// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

// Creature class

// Create a "bloop" creature
class Bloop {
  constructor(l, dna_) {
    this.vx = undefined
    this.vy = undefined
    this.hasTarget = false
    this.position = l.copy(); // Location
    this.health = 200; // Life timer
    this.xoff = random(1000); // For perlin noise
    this.yoff = random(1000);
    this.target = null 
    this.dna = dna_; // DNA
    // DNA will determine size and maxspeed
    // The bigger the bloop, the slower it is
    this.maxspeed = map(this.dna.genes[0], 0, 1, 15, 0);
    this.r = map(this.dna.genes[0], 0, 1, 0, 50);//raio
    this.vision = map(this.dna.genes[1], 0, 1, this.r, this.r+50);
  }

  run(bloops) {
    this.update(bloops);
    this.borders();
    this.display();
  }

  // A bloop can find food and eat it
  eat(f) {
    let food = f.getFood();
    // Are we touching any food objects?
    for (let i = food.length - 1; i >= 0; i--) {
      let foodLocation = food[i];
      if (foodLocation == this.target) this.hasTarget = false
      let d = p5.Vector.dist(this.position, foodLocation);
      // If we are, juice up our strength!
      if (d < this.r / 2) {
        this.health += 100;
        this.hasTarget = false
        food.splice(i, 1);//remove a comida de id 1 no array de comidas
      }
    }
  }

  // At any moment there is a teeny, tiny chance a bloop will reproduce
  // reproduce() {
  //   // asexual reproduction
  //   if (random(1) < 0.0005) {
  //     // Child is exact copy of single parent
  //     let childDNA = this.dna.copy();
  //     // Child DNA can mutate
  //     childDNA.mutate(0.01);
  //     return new Bloop(this.position, childDNA);
  //   } else {
  //     return null;
  //   }
  // }
  
  searchForFood(f){
    // console.log("Searching for food, ", this)
    let food = f.getFood(); //array de comidinhas
    const maximumDistance = 4556789
    let dmin = maximumDistance
    let id = -1
    for (let i = food.length - 1; i >= 0; i--) {
      let foodLocation = food[i];
      let d = p5.Vector.dist(this.position, foodLocation);
      if (d <= this.vision) {
        this.hasTarget=true
        dmin = Math.min(dmin, d)
        if(dmin==d){
          id = i
        }
      }
    }
    if(dmin==maximumDistance){
      //this.hasTarget/
      return 
    }
    this.target = createVector(food[id].x , food[id].y)
    // this.vx=map(food[id].x, 0, width, -this.maxspeed, this.maxspeed)
    // this.vy=map(food[id].y, 0, height, -this.maxspeed, this.maxspeed)
  }

  searchForPartner(bloops, me){
    const maximumDistance = 4556789
    let dmin = maximumDistance
    let id = -1
    for (let i = bloops.length - 1; i >= 0; i--) {
      if(i==me) continue
      let bloopLocation = bloops[i].position;
      let d = p5.Vector.dist(this.position, bloopLocation);
      if (d <= this.r) {
        dmin = Math.min(dmin, d)
        if(dmin==d){
          id = i
        }
      }
    }
    if(dmin==maximumDistance || random(1) > 0.002){
      return bloops
    }
    let novo = this.crossover(bloops[id])
    bloops.push(novo)
    return bloops
  }

  crossover(par){
    let dna1 = this.dna.copy();
    let dna2 = par.dna.copy();
    let childDNA = new DNA([dna1.genes[0], dna2.genes[1]]) //instanciando o dna 
    let babyPosition = createVector(random(width), random(height))
    let novo = new Bloop(babyPosition, childDNA);
    return novo
  }

  // Method to update position
  update() {
    // Simple movement based on perlin noise
    let velocity
    if(this.hasTarget ){
      let currentSpeed = createVector(this.vx, this.vy).mag()
      velocity = p5.Vector.sub(this.target, this.position);
      velocity.setMag(currentSpeed);
    }else{
      this.vx = map(noise(this.xoff), 0, 1, -this.maxspeed, this.maxspeed);
      this.vy =map(noise(this.yoff), 0, 1, -this.maxspeed, this.maxspeed);
      velocity = createVector(this.vx, this.vy);
      this.xoff += 0.01;
      this.yoff += 0.01;
    }  
    
    this.position.add(velocity);
    // Death always looming
    this.health -= 0.2;
    // console.log(this)
  }

  // Wraparound
  borders() {
    if (this.position.x < -this.r/2) this.position.x = width+this.r/2;
    if (this.position.y < this.r/2) this.position.y = height+this.r/2;
    if (this.position.x > width+this.r/2) this.position.x = -this.r/2;
    if (this.position.y > height+this.r/2) this.position.y = -this.r/2;
  }

  // Method to display
  display() {
    ellipseMode(CENTER);
    stroke(0, this.health);
    fill(255, 0, 0, 12);//cor da visao com transparencia
    ellipse(this.position.x, this.position.y, this.vision, this.vision);
    fill(0, this.health);
    ellipse(this.position.x, this.position.y, this.r, this.r);
  }

  // Death
  dead() {
    if (this.health < 0.0) {
      return true;
    } else {
      return false;
    }
  }
}
