fetch("http://localhost:3000/events")
.then(res => res.json())
.then(data => {
    const container = document.getElementById("events");

    data.forEach(event => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.date} - ${event.venue}</p>
            <img src="${event.image}" width="200"/>
        `;
        container.appendChild(div);
    });
});