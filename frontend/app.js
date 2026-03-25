const BASE_URL = "http://Eventmanager-ALB-709254883.ap-south-1.elb.amazonaws.com";

fetch(`${BASE_URL}/events`)
  .then(res => res.json())
  .then(data => {
      const container = document.getElementById('events');

      data.forEach(event => {
          const div = document.createElement('div');
          div.innerHTML = `
              <h3>${event.title}</h3>
              <p>${event.date} - ${event.venue}</p>
              <img src="${event.image}" width="200"/>
          `;
          container.appendChild(div);
      });
  })
  .catch(err => console.error("Frontend fetch error:", err));