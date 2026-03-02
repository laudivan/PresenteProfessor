const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = '/data';
const ALUNOS_DIR = path.join(DATA_DIR, 'alunos');
const AULAS_FILE = path.join(DATA_DIR, 'aulas.json');

// Ensure directories and mock data exist
async function init() {
    try {
        await fs.mkdir(ALUNOS_DIR, { recursive: true });

        // Check if aulas.json exists, if not create a mock one for today
        try {
            await fs.access(AULAS_FILE);
        } catch {
            const today = new Date().toISOString().split('T')[0];
            const mockAulas = [{ codigo: "123", data: today, aberta: true }];
            await fs.writeFile(AULAS_FILE, JSON.stringify(mockAulas, null, 2));
            console.log(`Created mock aulas.json with code "123" for today (${today}).`);
        }
    } catch (err) {
        console.error('Error initializing data directories:', err);
    }
}

init();

// API Endpoints

// 1. Validate Code
app.post('/api/validate-code', async (req, res) => {
    try {
        const { codigo } = req.body;
        if (!codigo || codigo.length !== 3) {
            return res.status(400).json({ success: false, message: 'Código inválido. Deve conter 3 caracteres.' });
        }

        const today = new Date().toISOString().split('T')[0];
        let aulas = [];
        try {
            const aulasData = await fs.readFile(AULAS_FILE, 'utf-8');
            aulas = JSON.parse(aulasData);
        } catch (readErr) {
            console.error('Error reading aulas.json', readErr);
        }

        const validClass = aulas.find(aula => aula.codigo === codigo && aula.data === today);

        if (validClass) {
            if (validClass.aberta) {
                return res.json({ success: true, message: 'Código válido.' });
            } else {
                return res.status(403).json({ success: false, message: 'Chamada encerrada.' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'Código da aula não encontrado para hoje.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// 2. Check Student
app.post('/api/check-student', async (req, res) => {
    try {
        const { matricula } = req.body;
        if (!matricula) {
            return res.status(400).json({ success: false, message: 'Matrícula é obrigatória.' });
        }

        // Sanitize to prevent path traversal
        const safeMatricula = path.basename(String(matricula));
        const studentFile = path.join(ALUNOS_DIR, `${safeMatricula}.aluno.json`);

        try {
            const studentData = await fs.readFile(studentFile, 'utf-8');
            const student = JSON.parse(studentData);

            return res.json({
                success: true,
                exists: true,
                student: {
                    nome: student.nome,
                    nome_social: student.nome_social,
                    matricula: student.matricula
                }
            });
        } catch {
            // File does not exist
            return res.json({ success: true, exists: false });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// 3. Register Presence
app.post('/api/register-presence', async (req, res) => {
    try {
        const { matricula, nome, nome_social, email, codigo } = req.body;

        if (!matricula || !codigo) {
            return res.status(400).json({ success: false, message: 'Matrícula e Código da aula são obrigatórios.' });
        }

        // Sanitize matricula
        const safeMatricula = path.basename(String(matricula));
        const studentFile = path.join(ALUNOS_DIR, `${safeMatricula}.aluno.json`);

        let student;
        const nowISO = new Date().toISOString();

        try {
            // Try to read existing student
            const studentData = await fs.readFile(studentFile, 'utf-8');
            student = JSON.parse(studentData);

            // Check if presence already registered for this code
            const alreadyPresent = student.frequencia.some(p => p.codigo_verificacao === codigo);
            if (alreadyPresent) {
                return res.status(400).json({ success: false, message: 'Presença já registrada para esta aula.' });
            }

            // Add presence
            student.frequencia.push({
                data_hora: nowISO,
                codigo_verificacao: codigo
            });
        } catch {
            // File doesn't exist, create new student. Validation for required fields.
            if (!nome) {
                return res.status(400).json({ success: false, message: 'Aluno não encontrado. Nome é obrigatório para cadastro.' });
            }

            student = {
                matricula: parseInt(safeMatricula, 10) || safeMatricula,
                nome,
                nome_social: nome_social || '',
                email: email || '',
                frequencia: [
                    {
                        data_hora: nowISO,
                        codigo_verificacao: codigo
                    }
                ]
            };
        }

        // Save back to file
        await fs.writeFile(studentFile, JSON.stringify(student, null, 2));

        return res.json({ success: true, message: 'Presença registrada com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
