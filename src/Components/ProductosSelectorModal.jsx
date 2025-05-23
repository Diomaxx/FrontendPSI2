import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, ListGroup, Form, Spinner, Pagination } from "react-bootstrap";
import './Style.css';

export default function ProductSelectorModal({ setFieldValue, cantidadPersonas }) {
    const [show, setShow] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [products, setProducts] = useState([]);
    const [availableStock, setAvailableStock] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Number of products per page

    // Función para obtener los productos del inventario
    const fetchProductos = async () => {
        setLoading(true);
        try {
            // Obtener lista de productos
            const productsResponse = await fetch('/api/inventario/stock');
            if (!productsResponse.ok) {
                throw new Error('Error al obtener los productos');
            }
            const productsData = await productsResponse.json();
            setProducts(productsData);

            // Obtener stock disponible sin reservar
            const stockResponse = await fetch('http://34.123.227.162:8080/api/solicitudes-sin-responder/inventario');
            if (!stockResponse.ok) {
                throw new Error('Error al obtener el stock disponible');
            }
            const stockData = await stockResponse.json();
            setAvailableStock(stockData);

            setError(null);
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar los productos. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Cargar productos cuando se abre el modal
    const handleShow = () => {
        setShow(true);
        setCurrentPage(1); // Reset to first page when opening modal
        fetchProductos();
    };

    const handleClose = () => setShow(false);

    // Calcular la cantidad máxima disponible (30% del inventario)
    const getMaxQuantity = (productId) => {
        // Verificar si existe stock disponible para este producto
        if (availableStock[productId]) {
            // Obtener el stock total disponible para este producto
            const stockTotal = availableStock[productId];

            // Calcular el 10% del stock disponible como base
            let baseMax = Math.floor(stockTotal * 0.02);

            // Ajustar según la cantidad de personas (si está disponible)
            if (cantidadPersonas && !isNaN(parseInt(cantidadPersonas))) {
                // Calcular el factor de multiplicación: cantidadPersonas / 50
                const factor = Math.max(1, Math.ceil(parseInt(cantidadPersonas) * 0.2));

                // Calcular cantidad ajustada pero nunca exceder el stock disponible
                const adjustedMax = Math.min(baseMax * factor, stockTotal);
                return adjustedMax;
            }

            return baseMax;
        }
        return 0; // Si no hay stock disponible
    };

    const increment = (id) => {
        const maxQuantity = getMaxQuantity(id);
        setSelectedProducts((prev) => {
            const currentQuantity = prev[id] || 0;
            // No permitir incrementar más allá del 30% disponible
            if (currentQuantity >= maxQuantity) {
                return prev;
            }
            return {
                ...prev,
                [id]: currentQuantity + 1,
            };
        });
    };

    const decrement = (id) => {
        setSelectedProducts((prev) => {
            const current = prev[id] || 0;
            if (current <= 1) {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            }
            return {
                ...prev,
                [id]: current - 1,
            };
        });
    };

    // Mostrar el mensaje con el límite de cantidad
    const getQuantityMessage = (productId) => {
        const maxQuantity = getMaxQuantity(productId);
        const currentQuantity = selectedProducts[productId] || 0;
        if (currentQuantity >= maxQuantity) {
            return `Máximo alcanzado (${maxQuantity})`;
        }
        return `${currentQuantity} / ${maxQuantity} max`;
    };

    // Pagination logic
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <>
            <Button variant="link" className="btn-sm align-content-end justify-content-end align-self-end rounded-pill" onClick={handleShow}
                    disabled={!cantidadPersonas || isNaN(parseInt(cantidadPersonas)) || parseInt(cantidadPersonas) <= 0}
            >
                Ver Productos
            </Button>
            <Modal show={show} onHide={handleClose} size="lg" centered className="text-black">
                <Modal.Header className="bg-mine text-light">
                    <Modal.Title className="col-6">Seleccione Los Productos:</Modal.Title>
                    <Modal.Title className="col-6">Productos Seleccionados:</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark-subtle">
                    {loading ? (
                        <div className="text-center p-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                            <p className="mt-2">Cargando productos...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">
                            {error}
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="ms-2"
                                onClick={fetchProductos}
                            >
                                Reintentar
                            </Button>
                        </div>
                    ) : (
                        <Row className="px-2">
                            <Col md={6}>
                                <div className="mt-3">
                                    <h5>Disponibles {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} de {products.length}</h5>
                                    <ListGroup>
                                        {currentProducts.map((product) => (
                                            <ListGroup.Item key={product.id_articulo}
                                                            className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    {product.nombre_articulo}
                                                    <p className="text-opacity-50 text-black mb-0"
                                                       style={{fontSize: "small"}}> {product.medida_abreviada}</p>
                                                </div>
                                                <div className="d-flex flex-row align-items-end">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => decrement(product.id_articulo)}
                                                            disabled={!selectedProducts[product.id_articulo]}
                                                        >
                                                            -
                                                        </Button>
                                                        <div className="w-75">
                                                            <h6 className="mx-2 fw-lighter">{selectedProducts[product.id_articulo] || 0}</h6>
                                                        </div>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => increment(product.id_articulo)}
                                                            disabled={selectedProducts[product.id_articulo] >= getMaxQuantity(product.id_articulo)}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                    <small
                                                        className="text-muted ms-2">{getQuantityMessage(product.id_articulo)}</small>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    
                                    {/* Pagination controls with custom styling */}
                                    <div className="d-flex justify-content-center mt-3">
                                        <Pagination className="mb-0 pagination-custom">
                                            <Pagination.Prev 
                                                onClick={prevPage} 
                                                disabled={currentPage === 1} 
                                                className="bg-mine-light text-white border-0"
                                            />
                                            
                                            {/* Show only a limited number of page numbers */}
                                            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                                                // Calculate which page numbers to show
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    // Show pages 1-5 if we have 5 or fewer pages
                                                    pageNum = idx + 1;
                                                } else if (currentPage <= 3) {
                                                    // Show pages 1-5 if current page is close to beginning
                                                    pageNum = idx + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    // Show last 5 pages if current page is close to end
                                                    pageNum = totalPages - 4 + idx;
                                                } else {
                                                    // Otherwise show 2 before and 2 after current page
                                                    pageNum = currentPage - 2 + idx;
                                                }
                                                
                                                return (
                                                    <Pagination.Item
                                                        key={pageNum}
                                                        active={pageNum === currentPage}
                                                        onClick={() => paginate(pageNum)}
                                                        className={pageNum === currentPage ? "bg-mine border-0" : "bg-mine-light text-white border-0"}
                                                    >
                                                        {pageNum}
                                                    </Pagination.Item>
                                                );
                                            })}
                                            
                                            <Pagination.Next 
                                                onClick={nextPage} 
                                                disabled={currentPage === totalPages} 
                                                className="bg-mine-light text-white border-0"
                                            />
                                        </Pagination>
                                    </div>

                                    {/* CSS for pagination styling */}
                                    <style jsx="true">{`
                                        .pagination-custom .page-item .page-link {
                                            background-color: rgba(39, 83, 126, 0.7);
                                            color: white;
                                            border: none;
                                        }
                                        .pagination-custom .page-item.active .page-link {
                                            background-color: rgb(39, 83, 126);
                                            color: white;
                                            border: none;
                                        }
                                        .pagination-custom .page-item .page-link:hover {
                                            background-color: rgb(39, 83, 126);
                                        }
                                        .pagination-custom .page-item.disabled .page-link {
                                            background-color: rgba(39, 83, 126, 0.4);
                                            color: rgba(255, 255, 255, 0.6);
                                        }
                                        
                                        /* Custom scrollbar styling */
                                        .selected-products-container::-webkit-scrollbar {
                                            width: 8px;
                                        }
                                        .selected-products-container::-webkit-scrollbar-track {
                                            background: #f1f1f1;
                                            border-radius: 4px;
                                        }
                                        .selected-products-container::-webkit-scrollbar-thumb {
                                            background: rgb(39, 83, 126);
                                            border-radius: 4px;
                                        }
                                        .selected-products-container::-webkit-scrollbar-thumb:hover {
                                            background: rgba(39, 83, 126, 0.8);
                                        }
                                    `}</style>
                                </div>
                            </Col>

                            <Col md={6} className="bg-body-tertiary pt-2 rounded mt-3 pb-4" style={{height:"fit-content"}}>
                                <div className="d-flex justify-content-center align-items-center">
                                    <img src="/caja.svg" width="45%" height="45%" alt="Caja" className="opacity-50"/>
                                </div>
                                {/* Scrollable container for selected products */}
                                <div className="selected-products-container" style={{
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    border: '1px solid #eee',
                                    borderRadius: '4px',
                                    padding: Object.keys(selectedProducts).length === 0 ? '0' : '8px'
                                }}>
                                    {Object.keys(selectedProducts).length === 0 ? (
                                        <p className="m-3">No tienes productos seleccionados.</p>
                                    ) : (
                                        <ListGroup>
                                            {Object.entries(selectedProducts).map(([id, quantity]) => {
                                                const product = products.find((p) => p.id_articulo === parseInt(id));
                                                return (
                                                    <ListGroup.Item key={id} className="d-flex justify-content-between">
                                                        <div>{product?.nombre_articulo} - {product?.medida_abreviada}</div>
                                                        <div>{quantity}</div>
                                                    </ListGroup.Item>
                                                );
                                            })}
                                        </ListGroup>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-mine">
                    <Button variant="secondary" onClick={handleClose} className="rounded-pill">Cerrar</Button>
                    <Button
                        className="btn-success text-light rounded-pill"
                        onClick={() => {
                            // Crear formato legible para mostrar al usuario
                            const formatted = Object.entries(selectedProducts)
                                .map(([id, quantity]) => {
                                    const product = products.find((p) => p.id_articulo === parseInt(id));
                                    return `${product?.nombre_articulo} (${product?.medida_abreviada}): ${quantity}`;
                                })
                                .join(", ");

                            // Crear formato para la API ["1:10", "2:15", etc]
                            const apiFormat = Object.entries(selectedProducts)
                                .map(([id, quantity]) => `${id}:${quantity}`);

                            setFieldValue("listaProductos", formatted);
                            setFieldValue("listaProductosAPI", apiFormat);
                            handleClose();
                        }}
                        disabled={Object.keys(selectedProducts).length === 0}
                    >
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
