const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/DELL - S/Desktop/artist - Copy/react-vite-tailwind/src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // The bad string was .replace(/\\/$/, '')
            const badString = ".replace(/\\\\/$, '')";
            const goodString = ".replace(/\\/$/, '')";
            
            if (content.includes(badString)) {
                console.log('Fixing:', filePath);
                const fixedContent = content.split(badString).join(goodString);
                fs.writeFileSync(filePath, fixedContent, 'utf8');
            }
        }
    });
}

walk(directory);
