const socket = io('ws://localhost:8080');

function addUserToQueue() {
    const userId = document.getElementById('userId').value;
    if (userId) {
        fetch('http://localhost:8080/queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId })
        }).then(response => response.json())
          .then(data => console.log(data));
    }
}

function clearQueue() {
    fetch('http://localhost:8080/queue', {
        method: 'DELETE'
    }).then(response => response.json())
      .then(data => console.log(data));
}

function updateQueue(queue) {
    const queueElement = document.getElementById('queue');
    queueElement.innerHTML = '<h2>Current Queue:</h2>';
    if (queue.length > 0) {
        const list = document.createElement('ul');
        queue.forEach(queueObject => {
            const item = document.createElement('li');
            item.textContent = queueObject.anonymousName;
            
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.setAttribute('data-user-id', queueObject.userId);
            removeButton.onclick = () => removeUserFromQueue(queueObject.userId);
            
            item.appendChild(removeButton);
            list.appendChild(item);
        });
        queueElement.appendChild(list);
    } else {
        queueElement.innerHTML += '<p>The queue is empty.</p>';
    }
}

socket.on('queue-updated', queue => {
    updateQueue(queue);
});

function removeUserFromQueue(userId) {
    fetch(`http://localhost:8080/queue/${userId}`, {
        method: 'DELETE'
    }).then(response => response.json())
      .then(data => console.log(data));
}