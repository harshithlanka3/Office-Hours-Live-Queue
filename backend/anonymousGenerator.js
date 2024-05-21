const colors = [
    "Amaranth", "Amber", "Amethyst", "Apricot", "Aquamarine", "Azure", "Beige", "Black", 
    "Blue", "Blush", "Bronze", "Brown", "Burgundy", "Carmine", "Cerise", "Cerulean", 
    "Champagne", "Chocolate", "Coffee", "Copper", "Coral", "Crimson", "Cyan", "Emerald", 
    "Erin", "Gainsboro", "Gold", "Gray", "Green", "Gunmetal", "Harlequin", "Honeydew", 
    "Iceberg", "Icterine", "Indigo", "Ivory", "Jade", "Jasmine", "Jet", "Lava", 
    "Lavender", "Lemon", "Lilac", "Lime", "Liver", "Magenta", "Magnolia", "Mahogany", 
    "Maize", "Mandarin", "Mango", "Marigold", "Maroon", "Mauve", "Melon", "Mindaro", 
    "Mint", "Mulberry", "Mustard", "Mystic", "Ochre", "Olive", "Orange", "Orchid", 
    "Peach", "Pear", "Periwinkle", "Pink", "Plum", "Puce", "Purple", "Raspberry", 
    "Red", "Red-violet", "Rose", "Ruby", "Salmon", "Sangria", "Sapphire", "Scarlet", 
    "Silver", "Tan", "Taupe", "Teal", "Turquoise", "Ultramarine", "Violet", "Viridian", 
    "White", "Yellow"
];

const animals = [
    "Alligator", "Anteater", "Armadillo", "Auroch", "Axolotl", 
    "Badger", "Bat", "Beaver", "Buffalo", "Camel", "Capybara", 
    "Chameleon", "Cheetah", "Chinchilla", "Chipmunk", "Chupacabra", 
    "Cormorant", "Coyote", "Crow", "Dingo", "Dinosaur", "Dolphin", 
    "Duck", "Elephant", "Ferret", "Fox", "Frog", "Giraffe", 
    "Gopher", "Grizzly", "Hedgehog", "Hippo", "Hyena", "Ibex", 
    "Ifrit", "Iguana", "Jackal", "Kangaroo", "Koala", "Kraken", 
    "Lemur", "Leopard", "Liger", "Llama", "Manatee", "Mink", 
    "Monkey", "Moose", "Narwhal", "Orangutan", "Otter", "Panda", 
    "Penguin", "Platypus", "Pumpkin", "Python", "Quagga", "Rabbit", 
    "Raccoon", "Rhino", "Sheep", "Shrew", "Skunk", "Squirrel", 
    "Tiger", "Turtle", "Walrus", "Wolf", "Wolverine", "Wombat"
];


function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function generateAlias() {
    const color = getRandomElement(colors);
    const animal = getRandomElement(animals);
    return `${color} ${animal}`;
}

module.exports = { generateAlias };
