document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        codigo: '',
        matricula: '',
        student: null
    };

    // DOM Elements - Steps
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3Existing = document.getElementById('step-3-existing');
    const step3New = document.getElementById('step-3-new');
    const stepSuccess = document.getElementById('step-success');

    // DOM Elements - Forms & Inputs
    const formCode = document.getElementById('form-code');
    const inputCodigoAula = document.getElementById('codigoAula');

    const formMatricula = document.getElementById('form-matricula');
    const inputMatricula = document.getElementById('matricula');

    const formRegister = document.getElementById('form-register');
    const inputNome = document.getElementById('nome');
    const inputNomeSocial = document.getElementById('nomeSocial');
    const inputEmail = document.getElementById('email');

    // DOM Elements - Display Fields
    const displayNome = document.getElementById('display-nome');
    const displayNomeSocial = document.getElementById('display-nome-social');
    const displayNomeSocialContainer = document.getElementById('display-nome-social-container');
    const displayMatriculaShow = document.getElementById('display-matricula-show');

    // DOM Elements - Buttons & Spinners
    const btnSubmitCode = document.getElementById('btn-submit-code');
    const spinnerCode = document.getElementById('spinner-code');
    const btnSubmitMatricula = document.getElementById('btn-submit-matricula');
    const spinnerMatricula = document.getElementById('spinner-matricula');
    const btnConfirmPresence = document.getElementById('btn-confirm-presence');
    const spinnerConfirm = document.getElementById('spinner-confirm');
    const btnSubmitRegister = document.getElementById('btn-submit-register');
    const spinnerRegister = document.getElementById('spinner-register');

    // Navigation Buttons
    const btnVoltarStep1 = document.getElementById('btn-voltar-step1');
    const btnVoltarStep2Existing = document.getElementById('btn-voltar-step2-existing');
    const btnVoltarStep2New = document.getElementById('btn-voltar-step2-new');

    const alertContainer = document.getElementById('alert-container');

    // --- Helper Functions ---

    function showStep(stepElement) {
        [step1, step2, step3Existing, step3New, stepSuccess].forEach(el => el.classList.add('d-none'));
        stepElement.classList.remove('d-none');
    }

    function showAlert(message, type = 'danger') {
        const id = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${id}" class="alert alert-${type} alert-dismissible alert-custom" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertContainer.insertAdjacentHTML('beforeend', alertHtml);

        // Auto remove after 5 seconds
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('fade-out-up');
                setTimeout(() => el.remove(), 300); // Wait for exit animation
            }
        }, 5000);
    }

    function toggleLoading(button, spinner, isLoading) {
        if (isLoading) {
            button.disabled = true;
            spinner.classList.remove('d-none');
        } else {
            button.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    // --- API Calls ---

    async function apiValidateCode(codigo) {
        const response = await fetch('/api/validate-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo })
        });
        return await response.json();
    }

    async function apiCheckStudent(matricula) {
        const response = await fetch('/api/check-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula })
        });
        return await response.json();
    }

    async function apiRegisterPresence(data) {
        const response = await fetch('/api/register-presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    // --- Event Listeners ---

    // Step 1 -> Step 2
    formCode.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = inputCodigoAula.value.trim().toUpperCase();

        if (codigo.length !== 3) {
            showAlert('O código da aula deve conter 3 caracteres.');
            return;
        }

        toggleLoading(btnSubmitCode, spinnerCode, true);

        try {
            const data = await apiValidateCode(codigo);
            if (data.success) {
                state.codigo = codigo;
                showStep(step2);
                setTimeout(() => inputMatricula.focus(), 100);
            } else {
                showAlert(data.message);
                inputCodigoAula.value = '';
                inputCodigoAula.focus();
            }
        } catch (error) {
            showAlert('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            toggleLoading(btnSubmitCode, spinnerCode, false);
        }
    });

    // Step 2 -> Step 3
    formMatricula.addEventListener('submit', async (e) => {
        e.preventDefault();
        const matricula = inputMatricula.value.trim();

        if (!matricula) {
            showAlert('Informe sua matrícula.');
            return;
        }

        toggleLoading(btnSubmitMatricula, spinnerMatricula, true);

        try {
            const data = await apiCheckStudent(matricula);
            if (data.success) {
                state.matricula = matricula;
                if (data.exists) {
                    state.student = data.student;
                    // Populate display
                    displayNome.textContent = state.student.nome;
                    displayMatriculaShow.textContent = `Matrícula: ${state.student.matricula}`;

                    if (state.student.nome_social) {
                        displayNomeSocial.textContent = state.student.nome_social;
                        displayNomeSocialContainer.classList.remove('d-none');
                    } else {
                        displayNomeSocialContainer.classList.add('d-none');
                    }

                    showStep(step3Existing);
                } else {
                    // New student form
                    inputNome.value = '';
                    inputNomeSocial.value = '';
                    inputEmail.value = '';
                    showStep(step3New);
                    setTimeout(() => inputNome.focus(), 100);
                }
            } else {
                showAlert(data.message || 'Erro ao buscar matrícula.');
            }
        } catch (error) {
            showAlert('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            toggleLoading(btnSubmitMatricula, spinnerMatricula, false);
        }
    });

    // Step 3A -> Confirm Presence
    btnConfirmPresence.addEventListener('click', async () => {
        toggleLoading(btnConfirmPresence, spinnerConfirm, true);

        try {
            const result = await apiRegisterPresence({
                matricula: state.matricula,
                codigo: state.codigo
            });

            if (result.success) {
                showStep(stepSuccess);
            } else {
                showAlert(result.message);
            }
        } catch (error) {
            showAlert('Erro ao registrar presença. Tente novamente.');
        } finally {
            toggleLoading(btnConfirmPresence, spinnerConfirm, false);
        }
    });

    // Step 3B -> Register and Confirm Presence
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = inputNome.value.trim();
        const nomeSocial = inputNomeSocial.value.trim();
        const email = inputEmail.value.trim();

        if (!nome) {
            showAlert('Nome completo é obrigatório.');
            return;
        }

        toggleLoading(btnSubmitRegister, spinnerRegister, true);

        try {
            const result = await apiRegisterPresence({
                matricula: state.matricula,
                codigo: state.codigo,
                nome,
                nome_social: nomeSocial,
                email
            });

            if (result.success) {
                showStep(stepSuccess);
            } else {
                showAlert(result.message);
            }
        } catch (error) {
            showAlert('Erro ao registrar presença. Tente novamente.');
        } finally {
            toggleLoading(btnSubmitRegister, spinnerRegister, false);
        }
    });

    // --- Back Buttons ---
    btnVoltarStep1.addEventListener('click', () => {
        state.codigo = '';
        inputCodigoAula.value = '';
        showStep(step1);
        setTimeout(() => inputCodigoAula.focus(), 100);
    });

    [btnVoltarStep2Existing, btnVoltarStep2New].forEach(btn => {
        btn.addEventListener('click', () => {
            state.matricula = '';
            state.student = null;
            inputMatricula.value = '';
            showStep(step2);
            setTimeout(() => inputMatricula.focus(), 100);
        });
    });

    // Auto-focus code input on load
    inputCodigoAula.focus();
});
