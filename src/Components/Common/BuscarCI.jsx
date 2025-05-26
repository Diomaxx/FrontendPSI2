import React, {useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link, useNavigate} from 'react-router-dom';
import {registerUser} from "../../Services/authService.js";
import Header from "./Header.jsx";
import "../Style.css";

function BuscarCI() {
    const navigate = useNavigate();
    const [isMember, setIsMember] = useState(null);
    const initialValues = {
        ci: '',
    };

    const validationSchema = Yup.object({

        ci: Yup.string()
            .required('El C.I. es obligatorio'),

    });
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        console.log('Form values:', values);
        try {
            await registerUser(values);
            navigate('/login');
        } catch (error) {
            console.error('Error al registrar:', error);
            setErrors({ general: error.response?.data?.message || 'Error en el registro' });
        }
        setSubmitting(false);
    };

    return (
        <div className="big-div">
            <Header/>
            <div
                className="container-fluid d-flex flex-column align-items-center flex-grow-0 h-100 justify-content-center mt-5">
                <div className="row p-4 m-3 shadow rounded flex-grow-1 w-auto text-light"
                     style={{background: 'rgba(1,1,1,0.22)', maxWidth: '500px', width: '100%'}}>
                    <h3 className="text-center fw-semibold fs-3 mb-2 pb-0" style={{color: '#fdfdfd'}}>Crear una
                        Cuenta</h3>
                    <p className="text-center">¿Ya eres un miembro de Alas Chiquitanas?</p>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({isSubmitting}) => (
                            <Form>
                                <div className="d-flex flex-row gap-3">

                                    <button
                                        type="button"
                                        className="btn mt-2 w-100 fw-semibold rounded-pill btn-outline-light"
                                        onClick={() => navigate('/registrate')}
                                        disabled={isSubmitting}
                                    >
                                        No
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsMember(true)}
                                        className={`btn mt-2 w-100 fw-semibold rounded-pill ${
                                            isMember === true ? 'btn-light text-dark' : 'btn-outline-light'
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        Sí
                                    </button>
                                </div>
                                {isMember && (
                                    <div className="mt-3">
                                        <div className="mb-3">
                                            <label htmlFor="ci" className="form-label">
                                                Cédula de Identidad (C.I.):
                                            </label>
                                            <Field
                                                type="number"
                                                name="ci"
                                                className="form-control ps-4"
                                                placeholder="Ej. 1234567"
                                            />
                                            <ErrorMessage
                                                name="ci"
                                                component="div"
                                                className="text-light opacity-50"
                                                style={{fontSize: 'smaller'}}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn mt-2 w-100 fw-semibold rounded-pill btn-warning"
                                            style={{color: 'black'}}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Buscando...' : 'Continuar'}
                                        </button>
                                    </div>
                                )}
                                <p className="mt-3 mb-3 text-center ms-5 me-5"
                                   style={{color: 'grey', fontSize: 'smaller'}}>
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" style={{color: '#ffd833'}}>
                                        Ingresar
                                    </Link>.
                                </p>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default BuscarCI;