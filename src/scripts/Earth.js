import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import versor from 'versor';

function Earth() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const projection = geoOrthographic()
      .scale((height - 10) / 2)
      .translate([width / 2, height / 2])
      .precision(0.1);

    const path = geoPath().projection(projection).context(context);

    d3.json('https://unpkg.com/world-atlas@1/world/110m.json').then(world => {
      const land = feature(world, world.objects.land);

      d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        (d3.select(canvas));

      function dragstarted(event) {
        this.v0 = versor.cartesian(projection.invert([event.x, event.y]));
        this.r0 = projection.rotate();
        this.q0 = versor(this.r0);
      }

      function dragged(event) {
        const v1 = versor.cartesian(projection.rotate(this.r0).invert([event.x, event.y]));
        const q1 = versor.multiply(this.q0, versor.delta(this.v0, v1));
        const r1 = versor.rotation(q1);
        projection.rotate(r1);
        context.clearRect(0, 0, width, height);
        context.beginPath();
        path(land);
        context.fill();
      }

      context.beginPath();
      path(land);
      context.fill();
    });
  }, []);

  return <canvas ref={canvasRef} width="1200" height="1200" />;
}

export default Earth;