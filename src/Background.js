export default {
  name: 'Background',
  render(){
    return `<canvas id="cv" width="${window.innerWidth}" height="${window.innerHeight}"></canvas>`
  },
  data: {
    gridSize: 100,
    maximumIntensity: 1,
    grid: [],
  },
  setMousePosition(pos) {
   const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
   if (pos.clientY + scrollPos > window.innerHeight) return;
   const posX = pos.clientX / window.innerWidth;
   const posY = (pos.clientY + scrollPos) / window.innerWidth;
   const x = Math.floor(posX * this.gridSize);
   const y = Math.floor(posY * this.gridSize);
   this.ws.send(JSON.stringify({ x, y }));
   this.grid[x][y]++;
   this.populateGrid();
  },
  populateGrid(){
    const gridSize = window.innerWidth / 100;
    const canvas = document.getElementById('cv');
    for(let x=0; x<this.gridSize; x++){
      for(let y=0; y<this.gridSize; y++){
        const intensity = this.grid[x][y];
        const ctx = canvas.getContext("2d");
        const posX = Math.round(x/100 * window.innerWidth);
        const posY = Math.round(y/100 * window.innerWidth);
        if(intensity>0){
          ctx.fillStyle = this.getColor(intensity);
          ctx.fillRect(posX,posY,gridSize,gridSize);
        }
      }
    }
  },
  getColor(intensity){
    const scale = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    const relativeIntensity = intensity/this.maxIntensity;
    const blue = Math.round(relativeIntensity * scale.length);
    const b = scale[blue] || 'f';
    return `#0000${b}${b}`;
  },
  mounted() {
    this.ws = new WebSocket("ws://ec2-54-194-151-237.eu-west-1.compute.amazonaws.com:8080");
    this.ws.onmessage = (response)=>{
      const { grid, maxIntensity } = JSON.parse(response.data);
      this.grid = grid;
      this.maxIntensity = maxIntensity;
      this.populateGrid();
    };
    window.addEventListener("mousemove", (pos)=>(this.setMousePosition(pos)), false);
  }
};