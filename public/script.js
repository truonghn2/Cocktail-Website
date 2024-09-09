document.getElementById('new-cocktail').addEventListener('click', function() {
    window.location.reload(); //reload the page when you click the button
});


//favorites icon functionality
const image = document.getElementById('fav-icon');

image.addEventListener('mouseover', function() {
    image.src = 'hearted-icon.png';
});

image.addEventListener('mouseout', function() {
    image.src = 'favorite-icon.png';  
});

//favorites icon click functionality
document.getElementById('fav-icon').addEventListener('click', function() {
    const cocktail = {
        name: document.querySelector('.drink-title h1').textContent,
        image_url: document.querySelector('.container img').src, 
        instructions: document.querySelector('.ingred-instruct p').textContent, 
        ingredients: Array.from(document.querySelectorAll('.ingred-instruct ul li')).map(li => li.textContent) 
    };

    fetch('/save-cocktail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cocktail)
    })
    .then(response => {
        if (response.ok) {
            alert('Cocktail saved!');
        } else {
            alert('Failed to save cocktail.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving cocktail.');
    });
});