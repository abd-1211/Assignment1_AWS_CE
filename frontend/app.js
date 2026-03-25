fetch('http://Eventmanager-ALB-709254883.ap-south-1.elb.amazonaws.com')
  .then(res => res.json())
  .then(data => {
      const container = document.getElementById('events');
      data.forEach(event => {
          const div = document.createElement('div');
          // include image from S3
          div.innerHTML = `
              <h3>${event.title}</h3>
              <p>${event.date} - ${event.venue}</p>
              ${event.image ? `<img src="${event.image}" alt="Event Poster" width="200">` : ""}
          `;
          container.appendChild(div);
      });
  })
  .catch(err => console.error("Frontend fetch error:", err));