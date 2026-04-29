const fs = require('fs');
const path = require('path');

// 导出的文件名
const outputFilePath = path.join(__dirname, 'frontend_dump.txt');

// 需要扫描的目录或文件（按需调整）
const targets = [
    'src', 
    'package.json', 
    'next.config.js', 
    'next.config.mjs', 
    'tailwind.config.ts', 
    'tailwind.config.js',
    'tsconfig.json'
];

// 允许导出的文件后缀，过滤掉图片、字体等二进制文件
const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs'];

let outputContent = '';

function readDirRecursive(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            readDirRecursive(fullPath);
        } else {
            const ext = path.extname(file);
            if (validExtensions.includes(ext)) {
                // 为了让 AI 更好识别，统一加上相对路径前缀
                const relativePath = path.relative(__dirname, fullPath);
                outputContent += `\n\n===== FILE: ./${relativePath} =====\n`;
                outputContent += fs.readFileSync(fullPath, 'utf-8');
            }
        }
    }
}

targets.forEach(target => {
    const fullPath = path.join(__dirname, target);
    if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            readDirRecursive(fullPath);
        } else {
            const relativePath = path.relative(__dirname, fullPath);
            outputContent += `\n\n===== FILE: ./${relativePath} =====\n`;
            outputContent += fs.readFileSync(fullPath, 'utf-8');
        }
    }
});

fs.writeFileSync(outputFilePath, outputContent);
console.log(`✅ 代码已成功导出到: ${outputFilePath}`);