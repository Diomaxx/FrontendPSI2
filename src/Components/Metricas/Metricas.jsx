import React, { useEffect, useState, useRef } from 'react';
import { getMetricas } from '../../Services/metricasService.js';
import '../Style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from "../Common/Header.jsx";
import MetricasWebSocketListener from './MetricasWebsocketListener.jsx';
// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
// PDF generation
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Function to format time values
const formatTime = (value) => {
    if (value < 1) {
        return '<1 día';
    } else {
        return `${parseFloat(value).toFixed(1)} días`;
    }
};

const MetricasComponent = () => {
    const [metricas, setMetricas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for filters
    const [timeRange, setTimeRange] = useState('all');
    const [provinceFilter, setProvinceFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('general');

    // State for visible metrics
    const [visibleMetrics, setVisibleMetrics] = useState({
        general: {
            solicitudesRecibidas: true,
            donacionesEntregadas: true,
            tiempoPromedioRespuesta: true,
            tiempoPromedioEntrega: true,
            solicitudesPorMes: true,
            productosMasSolicitados: true
        },
        solicitudes: {
            sinResponder: true,
            aprobadas: true, 
            rechazadas: true,
            estadoSolicitudes: true,
            solicitudesPorProvincia: true
        },
        donaciones: {
            pendientes: true,
            entregadas: true,
            estadoDonaciones: true,
            informacion: true
        }
    });

    // Chart refs for PDF export
    const chartRefs = {
        monthlyChart: useRef(null),
        productsChart: useRef(null),
        solicitudesStatusChart: useRef(null),
        provincesChart: useRef(null),
        donacionesStatusChart: useRef(null)
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getMetricas();
                setMetricas(data);
                setError(null);
            } catch (error) {
                console.error('Error al obtener métricas:', error);
                setError('No se pudieron cargar las métricas. Intente nuevamente más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to handle time range changes
    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        filterData(range, provinceFilter, categoryFilter);
    };

    // Function to handle province filter changes
    const handleProvinceChange = (province) => {
        setProvinceFilter(province);
        filterData(timeRange, province, categoryFilter);
    };

    // Function to handle category filter changes
    const handleCategoryChange = (category) => {
        setCategoryFilter(category);
        filterData(timeRange, provinceFilter, category);
    };

    // Function to filter the data based on selected filters
    const filterData = (time, province, category) => {
        if (!metricas) return;
        
        // Clone the original metrics data for filtering
        let filteredData = { ...metricas };
        
        // Apply time range filter
        if (time !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (time) {
                case 'last7days':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'last30days':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case 'last90days':
                    startDate = new Date(now.setDate(now.getDate() - 90));
                    break;
                case 'thisYear':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = null;
            }
            
            console.log(`Filtering data from ${startDate} to now`);
            
            // For a complete implementation, you would filter each metric based on date
            // This is a simplified version - in a real app, you'd have API endpoints for these filters
            
            // Filter monthly data to show only relevant months
            if (startDate && filteredData.solicitudesPorMes) {
                // In a real implementation, you would use the backend to get filtered data
                // For this demo, we'll simulate filtering by showing a message
                console.log(`Applied time filter: ${time}`);
            }
        }
        
        // Apply province filter
        if (province !== 'all') {
            console.log(`Filtering data for province: ${province}`);
            
            // Filter province-specific data
            // In a real implementation, you would use the backend to get filtered data
            if (filteredData.solicitudesPorProvincia) {
                // Display only selected province data
                const selectedProvinceData = {};
                if (filteredData.solicitudesPorProvincia[province]) {
                    selectedProvinceData[province] = filteredData.solicitudesPorProvincia[province];
                    console.log(`Showing data only for ${province}`);
                }
            }
        }
        
        // Apply category filter
        if (category !== 'all') {
            console.log(`Filtering by category: ${category}`);
            
            // Toggle visibility based on category
            // This is a UI-level filter
            if (category === 'solicitudes') {
                setActiveTab('solicitudes');
            } else if (category === 'donaciones') {
                setActiveTab('donaciones');
            } else if (category === 'productos') {
                setActiveTab('general');
                setVisibleMetrics(prev => ({
                    ...prev,
                    general: {
                        ...prev.general,
                        productosMasSolicitados: true,
                        solicitudesRecibidas: false,
                        donacionesEntregadas: false,
                        tiempoPromedioRespuesta: false,
                        tiempoPromedioEntrega: false,
                        solicitudesPorMes: false
                    }
                }));
            }
        }
        
        // In a complete implementation, you would update the data state here
        // For now, we're just logging filter changes
        console.log('Filters applied:', { time, province, category });
        
        // Show a notification to the user
        const filterMessage = document.getElementById('filter-message');
        if (filterMessage) {
            filterMessage.innerHTML = `<div class="mt-2 mb-3 alert alert-info">
                <i class="bi bi-funnel-fill me-2"></i>
                Filtros aplicados: ${time !== 'all' ? `Tiempo: ${time}` : ''} 
                ${province !== 'all' ? `Provincia: ${province}` : ''} 
                ${category !== 'all' ? `Categoría: ${category}` : ''}
            </div>`;
            setTimeout(() => {
                filterMessage.innerHTML = '';
            }, 3000);
        }
    };

    // Function to toggle visibility of specific metrics
    const toggleMetricVisibility = (tab, metric) => {
        setVisibleMetrics(prev => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                [metric]: !prev[tab][metric]
            }
        }));
    };

    // Function to generate PDF report
    const generatePDF = () => {
        if (!metricas) {
            alert('No hay datos de métricas disponibles para generar el PDF.');
            return;
        }

        try {
            console.log('Starting PDF generation...');

        // Create a new jsPDF instance
        const doc = new jsPDF('portrait', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        
            console.log('PDF document created with dimensions:', { pageWidth, pageHeight });
            
            // Add fonts if needed
            // doc.addFont('fonts/Roboto-Regular.ttf', 'Roboto', 'normal');
            // doc.addFont('fonts/Roboto-Bold.ttf', 'Roboto', 'bold');
            
            // Color constants
            const primaryColor = [25, 73, 115];
            const secondaryColor = [35, 35, 35];
            const accentColor = [255, 193, 7];
            const lightGray = [230, 230, 230];
            
            // Add current date
            const currentDate = new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            console.log('Generated date:', currentDate);
            
            // Define footer function early so it can be used anywhere in the code
            const addFooter = (doc, pages = null) => {
                const pageCount = pages || doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                
                for(let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setTextColor(150, 150, 150);
                    
                    // Page number
                    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                    
                    // System name and date on footer
                    doc.text('Sistema de Seguimiento de Donaciones', margin, pageHeight - 10);
                    doc.text(`Generado: ${currentDate}`, pageWidth/2, pageHeight - 10, { align: 'center' });
                    
                    // Footer line
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.5);
                    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
                }
            };
            
            // Helper function to safely add images to PDF
            const safelyAddImage = (doc, imageSrc, x, y, width, height) => {
                try {
                    // Check if the image path is a data URL or a regular path
                    if (imageSrc.startsWith('data:')) {
                        // It's already a data URL, use it directly
                        doc.addImage(imageSrc, 'PNG', x, y, width, height, undefined, 'FAST');
                        return true;
                    } else {
                        // For regular paths, we need a fallback mechanism
                        try {
                            doc.addImage(imageSrc, 'PNG', x, y, width, height, undefined, 'FAST');
                            return true;
                        } catch (directError) {
                            console.error(`Could not load image from ${imageSrc}:`, directError);
                            
                            // Fallback: Create a placeholder
                            doc.setDrawColor(200, 200, 200);
                            doc.setFillColor(240, 240, 240);
                            doc.roundedRect(x, y, width, height, 2, 2, 'FD');
                            
            doc.setFontSize(10);
                            doc.setTextColor(100, 100, 100);
                            doc.text('Imagen no disponible', x + width/2, y + height/2, { align: 'center' });
                            return false;
                        }
                    }
                } catch (error) {
                    console.error('Error in safelyAddImage:', error);
                    return false;
                }
            };
            
            // Cover page
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 60, 'F');
            
            // Add logo on cover - using our safe function with corrected aspect ratio
            // Using more height to prevent the logo from appearing squished
            safelyAddImage(doc, '/logoNOBG.png', pageWidth/2 - 25, 10, 50, 50);
            
            // Title
            doc.setFontSize(24);
            doc.setTextColor(50, 50, 50);
            doc.text('Reporte de Distribución', pageWidth/2, 80, { align: 'center' });
            
            // Subtitle
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text('Sistema de Seguimiento de Donaciones', pageWidth/2, 90, { align: 'center' });
            
            // Date
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Informe generado el: ${currentDate}`, pageWidth/2, 100, { align: 'center' });
            
            // Decorative element
            doc.setDrawColor(...accentColor);
            doc.setLineWidth(1);
            doc.line(margin + 20, 110, pageWidth - margin - 20, 110);
            
            // Add footer to the cover page
            addFooter(doc, 1);
            
            // Add summary page - moving directly to this page without the index
            doc.addPage();
            
            // Section header style
            const addSectionHeader = (text, y, sectionNumber) => {
                doc.setFillColor(...primaryColor);
                doc.rect(margin, y - 6, contentWidth, 10, 'F');
                doc.setFontSize(12);
                doc.setTextColor(255, 255, 255);
                doc.text(text, margin + 5, y);
                return y + 15;
            };
            
            // Page header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 20, 'F');
            
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text('Resumen General', pageWidth/2, 13, { align: 'center' });
            
            // Add date to header
            doc.setFontSize(8);
            doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
            
            // Main metrics in boxes
            let startY = 30;
            doc.setDrawColor(...lightGray);
            
            // Create a row of key metrics boxes
            const createMetricBoxes = (metrics, startY) => {
                const boxWidth = contentWidth / metrics.length;
                const boxHeight = 25;
                
                metrics.forEach((metric, index) => {
                    const xPos = margin + (index * boxWidth);
                    
                    // Box background
                    doc.setFillColor(250, 250, 250);
                    doc.roundedRect(xPos, startY, boxWidth - 4, boxHeight, 1, 1, 'F');
                    
                    // Metric value
            doc.setFontSize(16);
                    doc.setTextColor(...secondaryColor);
                    doc.text(metric.value.toString(), xPos + boxWidth/2, startY + 12, { align: 'center' });
                    
                    // Metric label
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text(metric.label, xPos + boxWidth/2, startY + 20, { align: 'center' });
                });
                
                return startY + boxHeight + 10;
            };
            
            // Section subtitle style
            const addSubsectionHeader = (text, y, sectionNumber, subsectionNumber) => {
                doc.setFontSize(11);
                doc.setTextColor(...primaryColor);
                doc.text(text, margin, y);
                
                doc.setDrawColor(...lightGray);
                doc.setLineWidth(0.5);
                doc.line(margin, y + 3, margin + doc.getTextWidth(text), y + 3);
                
                return y + 10;
            };
            
            // Add section 1.1 subtitle
            startY = addSubsectionHeader('Principales Métricas', startY, 1, 1);
            
            // Row 1 of metrics
            const row1Metrics = [
                { label: 'Solicitudes Atendidas', value: metricas.totalSolicitudesRecibidas },
                { label: 'Donaciones Entregadas', value: metricas.donacionesEntregadas },
                { label: 'Solicitudes Sin Responder', value: metricas.solicitudesSinResponder }
            ];
            
            startY = createMetricBoxes(row1Metrics, startY);
            
            // Row 2 of metrics
            const row2Metrics = [
                { label: 'Solicitudes Aprobadas', value: metricas.solicitudesAprobadas },
                { label: 'Solicitudes Rechazadas', value: metricas.solicitudesRechazadas },
                { label: 'Donaciones Pendientes', value: metricas.donacionesPendientes }
            ];
            
            startY = createMetricBoxes(row2Metrics, startY);
            
            // Row 3 of metrics
            const row3Metrics = [
                { label: 'Tiempo Prom. Respuesta (días)', value: formatTime(metricas.tiempoPromedioRespuesta) },
                { label: 'Tiempo Prom. Entrega (días)', value: formatTime(metricas.tiempoPromedioEntrega) }
            ];
            
            startY = createMetricBoxes(row3Metrics, startY + 5);
            
            // Add subsection 1.2 header
            startY = addSubsectionHeader('Productos más Solicitados', startY + 10, 1, 2);
            
            // Products table
            const productsData = Object.entries(metricas.topProductosMasSolicitados)
                .map(([product, count]) => [product, count])
                .sort((a, b) => b[1] - a[1]); // Sort by count descending
            
            autoTable(doc, {
                startY: startY,
                head: [['Producto', 'Cantidad', '% del Total']],
                body: productsData.map(([product, count]) => {
                    const totalProducts = productsData.reduce((sum, [_, c]) => sum + c, 0);
                    const percentage = ((count / totalProducts) * 100).toFixed(1);
                    return [product, count, `${percentage}%`];
                }),
                theme: 'grid',
                styles: { 
                    fontSize: 9,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 25, halign: 'center' }
                },
                margin: { left: margin, right: margin }
            });
            
            // Add insights about product distribution
            startY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            
            // Calculate insights
            const topProduct = productsData[0];
            const totalProductCount = productsData.reduce((sum, [_, count]) => sum + count, 0);
            
            doc.text('Análisis de productos solicitados:', margin, startY);
            startY += 5;
            doc.setFontSize(9);
            doc.text(`• El producto más solicitado es "${topProduct[0]}" con ${topProduct[1]} solicitudes (${((topProduct[1] / totalProductCount) * 100).toFixed(1)}% del total)`, margin + 5, startY);
            startY += 5;
            
            if (productsData.length > 1) {
                const secondProduct = productsData[1];
                doc.text(`• El segundo producto más solicitado es "${secondProduct[0]}" con ${secondProduct[1]} solicitudes (${((secondProduct[1] / totalProductCount) * 100).toFixed(1)}% del total)`, margin + 5, startY);
                startY += 5;
            }
            
            doc.text(`• En total se muestran los ${productsData.length} tipos diferentes de productos más solicitados`, margin + 5, startY);
            startY += 10;
            
            // Monthly data section on page 4
            doc.addPage();
            
            // Page header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 20, 'F');
            
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text('Análisis por Periodos y Ubicación', pageWidth/2, 13, { align: 'center' });
            
            // Add date to header
            doc.setFontSize(8);
            doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
            
            // Solicitudes por mes section - subsection 2.1
            startY = 30;
            startY = addSubsectionHeader('Solicitudes por Mes', startY, 2, 1);
            
            // Create data for monthly chart and ensure it's sorted chronologically
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const monthOrder = {};
            monthNames.forEach((month, index) => {
                monthOrder[month] = index;
            });
            
            const monthlyData = Object.entries(metricas.solicitudesPorMes)
                .map(([month, count]) => [month, count])
                .sort((a, b) => {
                    // Try to sort by month name if possible
                    const monthA = monthOrder[a[0]];
                    const monthB = monthOrder[b[0]];
                    if (monthA !== undefined && monthB !== undefined) {
                        return monthA - monthB;
                    }
                    // Otherwise sort alphabetically
                    return a[0].localeCompare(b[0]);
                });
            
            // Enhanced monthly data table with better styling
            autoTable(doc, {
                startY: startY,
                head: [['Mes', 'Solicitudes']],
                body: monthlyData,
                theme: 'grid',
                styles: { 
                    fontSize: 9,
                    cellPadding: 5
                },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 30, halign: 'center' }
                },
                margin: { left: margin, right: margin },
                didDrawCell: (data) => {
                    // Add visual emphasis for highest value
                    if (data.section === 'body' && data.column.index === 1) {
                        const row = monthlyData[data.row.index];
                        const allValues = monthlyData.map(item => item[1]);
                        const maxValue = Math.max(...allValues);
                        
                        if (row[1] === maxValue) {
                            doc.setFillColor(245, 245, 160);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                            doc.setTextColor(0, 0, 0);
                            doc.text(row[1].toString(), data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2, {
                                align: 'center',
                                baseline: 'middle'
                            });
                        }
                    }
                }
            });
            
            // Add some insights about the monthly data
            startY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            
            // Calculate insights
            const allMonthlyValues = monthlyData.map(item => item[1]);
            const maxMonth = monthlyData.find(item => item[1] === Math.max(...allMonthlyValues));
            const minMonth = monthlyData.find(item => item[1] === Math.min(...allMonthlyValues));
            const averageRequests = allMonthlyValues.reduce((sum, val) => sum + val, 0) / allMonthlyValues.length;
            
            doc.text('Resumen de tendencia mensual:', margin, startY);
            startY += 5;
            doc.setFontSize(9);
            doc.text(`• Mes con mayor número de solicitudes: ${maxMonth[0]} (${maxMonth[1]} solicitudes)`, margin + 5, startY);
            startY += 5;
            doc.text(`• Mes con menor número de solicitudes: ${minMonth[0]} (${minMonth[1]} solicitudes)`, margin + 5, startY);
            startY += 5;
            doc.text(`• Promedio mensual de solicitudes: ${averageRequests.toFixed(1)} solicitudes`, margin + 5, startY);
            startY += 10;
            
            // Provincial data section - subsection 2.2
            startY = addSubsectionHeader('Solicitudes por Provincia', startY + 5, 2, 2);
            
            const provincesData = Object.entries(metricas.solicitudesPorProvincia)
                .map(([province, count]) => [province, count])
                .sort((a, b) => b[1] - a[1]); // Sort by count descending
            
            // Provinces table with enhanced styling
            autoTable(doc, {
                startY: startY,
                head: [['Provincia', 'Solicitudes', '% del Total']],
                body: provincesData.map(([province, count]) => {
                    const percentage = ((count / metricas.totalSolicitudesRecibidas) * 100).toFixed(1);
                    return [province, count, `${percentage}%`];
                }),
                theme: 'grid',
                styles: { 
                    fontSize: 9,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' }
                },
                margin: { left: margin, right: margin },
                didDrawCell: (data) => {
                    // Add visual emphasis for highest value
                    if (data.section === 'body' && data.column.index === 1) {
                        const row = provincesData[data.row.index];
                        const allValues = provincesData.map(item => item[1]);
                        const maxValue = Math.max(...allValues);
                        
                        if (row[1] === maxValue) {
                            doc.setFillColor(245, 245, 160);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                            doc.setTextColor(0, 0, 0);
                            doc.text(row[1].toString(), data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2, {
                                align: 'center',
                                baseline: 'middle'
                            });
                        }
                    }
                }
            });
            
            // Add insights about provincial data
            startY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            
            // Calculate insights
            const topProvince = provincesData[0];
            const totalProvinces = provincesData.length;
            
            doc.text('Distribución geográfica:', margin, startY);
            startY += 5;
            doc.setFontSize(9);
            doc.text(`• ${topProvince[0]} representa el ${((topProvince[1] / metricas.totalSolicitudesRecibidas) * 100).toFixed(1)}% del total de solicitudes`, margin + 5, startY);
            startY += 5;
            doc.text(`• ${totalProvinces} provincias han registrado solicitudes en el sistema`, margin + 5, startY);
            
            // Pie charts page (page 5)
            doc.addPage();
            
            // Page header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 20, 'F');
            
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text('Estado de Solicitudes y Donaciones', pageWidth/2, 13, { align: 'center' });
            
            // Add date to header
            doc.setFontSize(8);
            doc.text(`Generado: ${currentDate}`, pageWidth - margin, 13, { align: 'right' });
            
            // Status charts
            startY = 30;
            
            // Create pie chart section with tables side by side - subsection 3.1
            startY = addSubsectionHeader('Estado de Solicitudes', startY, 3, 1);
            
            // Solicitudes status table
            const solicitudesStatusData = [
                ['Sin Responder', metricas.solicitudesSinResponder, ((metricas.solicitudesSinResponder / metricas.totalSolicitudesRecibidas) * 100).toFixed(1) + '%'],
                ['Aprobadas', metricas.solicitudesAprobadas, ((metricas.solicitudesAprobadas / metricas.totalSolicitudesRecibidas) * 100).toFixed(1) + '%'],
                ['Rechazadas', metricas.solicitudesRechazadas, ((metricas.solicitudesRechazadas / metricas.totalSolicitudesRecibidas) * 100).toFixed(1) + '%']
            ];
            
            // Create first table with percentages
            autoTable(doc, {
                startY: startY,
                head: [['Estado', 'Cantidad', 'Porcentaje']],
                body: solicitudesStatusData,
                theme: 'grid',
                styles: { 
                    fontSize: 9,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 25, halign: 'center' }
                },
                margin: { left: margin, right: margin }
            });
            
            // Add solicitudes status chart
            try {
                const statusChartImg = getChartImageUrl(chartRefs.solicitudesStatusChart);
                if (statusChartImg) {
                    const chartWidth = 80;
                    const chartHeight = 80;
                    const chartX = pageWidth - margin - chartWidth - 10;
                    
                    // Add chart image to the PDF using our safe function
                    safelyAddImage(doc, statusChartImg, chartX, startY - 10, chartWidth, chartHeight);
                } else {
                    console.error('Could not generate solicitudes status chart image');
                }
            } catch (chartError) {
                console.error('Error adding status chart:', chartError);
            }
            
            // Donaciones section - subsection 3.2
            startY = doc.lastAutoTable.finalY + 20;
            startY = addSubsectionHeader('Estado de Donaciones', startY, 3, 2);
            
            // Donaciones status table with percentages
            const totalDonaciones = metricas.donacionesPendientes + metricas.donacionesEntregadas;
            const donacionesStatusData = [
                ['Pendientes', metricas.donacionesPendientes, ((metricas.donacionesPendientes / totalDonaciones) * 100).toFixed(1) + '%'],
                ['Entregadas', metricas.donacionesEntregadas, ((metricas.donacionesEntregadas / totalDonaciones) * 100).toFixed(1) + '%']
            ];
            
            autoTable(doc, {
                startY: startY,
                head: [['Estado', 'Cantidad', 'Porcentaje']],
                body: donacionesStatusData,
                theme: 'grid',
                styles: { 
                    fontSize: 9,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 25, halign: 'center' }
                },
                margin: { left: margin, right: margin }
            });
            
            // Add donaciones status chart
            try {
                const donacionesChartImg = getChartImageUrl(chartRefs.donacionesStatusChart);
                if (donacionesChartImg) {
                    const chartWidth = 80;
                    const chartHeight = 80;
                    const chartX = pageWidth - margin - chartWidth - 10;
                    
                    // Add chart image to the PDF using our safe function
                    safelyAddImage(doc, donacionesChartImg, chartX, startY - 10, chartWidth, chartHeight);
                } else {
                    console.error('Could not generate donaciones status chart image');
                }
            } catch (chartError) {
                console.error('Error adding donaciones chart:', chartError);
            }
            
            // No need to redefine the addFooter function here - we defined it earlier
            
            addFooter(doc);
            
            // Save PDF
            console.log('Saving PDF...');
            doc.save('Reporte_Metricas.pdf');
            console.log('PDF saved successfully!');
        } catch (error) {
            console.error('Error detallado al generar PDF:', error);
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
            alert(`Hubo un error al generar el PDF: ${error.message || 'Error desconocido'}. Por favor, intente nuevamente.`);
        }
    };

    // Function to handle metrics updates from WebSocket
    const handleMetricasActualizadas = (nuevasMetricas) => {
        console.log("🔄 Actualizando métricas con datos del WebSocket");
        setMetricas(nuevasMetricas);
    };

    if (loading) return (
        <div className="list-div">
            <Header/>
            <div className="flex-grow-1 m-1">
                <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                    <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1500px', width:'100%'}}>
                        
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                            <div className="glass-card p-5 text-center">
                                <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                                <p className="text-white mb-0 fs-5">Cargando métricas del sistema...</p>
                                <p className="text-light opacity-75 mt-2 mb-0 small">Obteniendo datos estadísticos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="list-div">
            <Header/>
            <div className="flex-grow-1 m-1">
                <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                    <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1500px', width:'100%'}}>
                        
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                            <div className="glass-card p-5 text-center">
                            <div className="alert alert-danger mb-0" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2 fs-4"></i>
                                    <div className="mt-2">
                                        <strong>Error al cargar las métricas</strong>
                                        <p className="mb-0 mt-2">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!metricas) return null;

    // Prepare chart data
    // 1. Solicitudes por mes
    const solicitudesPorMesData = {
        labels: Object.keys(metricas.solicitudesPorMes),
        datasets: [
            {
                label: 'Solicitudes',
                data: Object.values(metricas.solicitudesPorMes),
                // CHART COLORS: Modify these color values to change the bar chart colors
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(59, 119, 157)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                    'rgb(204, 229, 245)',
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    // 2. Productos más solicitados
    const productosMasSolicitadosData = {
        labels: Object.keys(metricas.topProductosMasSolicitados),
        datasets: [
            {
                label: 'Cantidad',
                data: Object.values(metricas.topProductosMasSolicitados),
                // CHART COLORS: Modify this array to change the pie chart segment colors
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(59, 119, 157)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                    'rgb(204, 229, 245)',
                ],
                // CHART COLORS: Modify this array to change the pie chart border colors
                borderColor: [
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // 3. Solicitudes por status
    const solicitudesStatusData = {
        labels: ['Sin Responder', 'Aprobadas', 'Rechazadas'],
        datasets: [
            {
                data: [
                    metricas.solicitudesSinResponder,
                    metricas.solicitudesAprobadas,
                    metricas.solicitudesRechazadas,
                ],
                // CHART COLORS: Modify this array to change the status pie chart colors
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            },
        ],
    };

    // 4. Donaciones status
    const donacionesStatusData = {
        labels: ['Pendientes', 'Entregadas'],
        datasets: [
            {
                data: [
                    metricas.donacionesPendientes,
                    metricas.donacionesEntregadas,
                ],
                // CHART COLORS: Modify this array to change the donations status pie chart colors
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(102, 147, 194)',
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            },
        ],
    };
    
    // 5. Solicitudes por provincia
    const solicitudesPorProvinciaData = {
        labels: Object.keys(metricas.solicitudesPorProvincia),
        datasets: [
            {
                label: 'Solicitudes',
                data: Object.values(metricas.solicitudesPorProvincia),
                // CHART COLORS: Modify these color values to change the province bar chart colors
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(59, 119, 157)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                    'rgb(204, 229, 245)',

                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Chart options for consistent styling
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    // CHART COLORS: Modify this to change the color of legend text
                    color: 'white',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                // CHART COLORS: Modify this to change the tooltip background color
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 13
                },
                padding: 10,
                cornerRadius: 0,
                displayColors: true
            }
        },
        scales: {
            x: {
                ticks: {
                    // CHART COLORS: Modify this to change the color of x-axis labels
                    color: 'white',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                },
                grid: {
                    // CHART COLORS: Modify this to change the color of x-axis grid lines
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    // CHART COLORS: Modify this to change the color of y-axis labels
                    color: 'white',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                },
                grid: {
                    // CHART COLORS: Modify this to change the color of y-axis grid lines
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    // Pie chart options (no scales)
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    // CHART COLORS: Modify this to change the color of pie chart legend text
                    color: 'white',
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                }
            },
            tooltip: {
                // CHART COLORS: Modify this to change the pie chart tooltip background color
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 13
                },
                padding: 10,
                cornerRadius: 0,
                displayColors: true
            }
        },
    };

    const provinceOptions = ['all', ...Object.keys(metricas.solicitudesPorProvincia)];
    const timeRangeOptions = ['all', 'last7days', 'last30days', 'last90days', 'thisYear'];
    const categoryOptions = ['all', 'solicitudes', 'donaciones', 'productos'];

    return (
        <div className="list-div">
            <Header/>
            
            <div className="container-fluid d-flex justify-content-center">
                <div className="w-100 align-items-center justify-content-center container-fluid"
                     style={{maxWidth: "1500px"}}>
                
                    <div className="mb-4 mt-4">
                        <div className="d-flex justify-content-end align-items-center mb-4">
                            <div className="d-flex gap-3">
                                <button 
                                    className="btn btn-sm btn-warning text-dark fw-medium rounded-pill"
                                    onClick={generatePDF}
                                    aria-label="Descargar reporte en PDF"
                                    style={{
                                        borderRadius: '4px',
                                        border: 'none',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <i className="bi bi-file-earmark-pdf me-1"></i> Descargar PDF
                                </button>
                                        </div>
                                        </div>

                        
                        <MetricasWebSocketListener onActualizarMetricas={handleMetricasActualizadas} />

                        
                        <ul className="nav nav-tabs border-0 mb-4 d-flex justify-content-center">
                            <li className="nav-item">
                                <button 
                                    className={`me-3 rounded-pill nav-link ${activeTab === 'general' ? 'active border-bottom border-top border-end border-start border-2 border-warning text-light' : 'text-light opacity-75 hover-effect'} border-0 bg-transparent`}
                                    onClick={() => setActiveTab('general')}
                                    aria-label="Ver resumen general"
                                >
                                    Resumen General
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`me-3 rounded-pill nav-link ${activeTab === 'solicitudes' ? 'active border-bottom border-top border-end border-start border-2 border-warning text-light' : 'text-light opacity-75 hover-effect'} border-0 bg-transparent`}
                                    onClick={() => setActiveTab('solicitudes')}
                                    aria-label="Ver solicitudes"
                                >
                                    Solicitudes
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`me-3 rounded-pill nav-link ${activeTab === 'donaciones' ? 'active border-bottom border-top border-end border-start border-2 border-warning text-light' : 'text-light opacity-75 hover-effect'} border-0 bg-transparent`}
                                    onClick={() => setActiveTab('donaciones')}
                                    aria-label="Ver donaciones"
                                >
                                    Donaciones
                                </button>
                            </li>
                        </ul>

                        
                        <div className="row">
                            
                            <div className="col-md-3 mb-4">
                                <div className="glass-panel p-3 rounded-3 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title mb-0 text-light">Métricas a Mostrar</h5>
                                        <button 
                                            className="btn btn-sm btn-outline-light rounded-pill" 
                                            onClick={() => {
                                                // Reset all metrics to visible
                                                setVisibleMetrics({
                                                    general: {
                                                        solicitudesRecibidas: true,
                                                        donacionesEntregadas: true,
                                                        tiempoPromedioRespuesta: true,
                                                        tiempoPromedioEntrega: true,
                                                        solicitudesPorMes: true,
                                                        productosMasSolicitados: true
                                                    },
                                                    solicitudes: {
                                                        sinResponder: true,
                                                        aprobadas: true, 
                                                        rechazadas: true,
                                                        estadoSolicitudes: true,
                                                        solicitudesPorProvincia: true
                                                    },
                                                    donaciones: {
                                                        pendientes: true,
                                                        entregadas: true,
                                                        estadoDonaciones: true,
                                                        informacion: true
                                                    }
                                                });
                                            }}
                                            aria-label="Mostrar todas las métricas"
                                        >
                                            <i className="bi bi-check-all me-1"></i> Todo
                                        </button>
                                    </div>
                                    
                                    {activeTab === 'general' && (
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSolicitudesRecibidas" 
                                                        checked={visibleMetrics.general.solicitudesRecibidas}
                                                        onChange={() => toggleMetricVisibility('general', 'solicitudesRecibidas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSolicitudesRecibidas">
                                                        Solicitudes Recibidas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showDonacionesEntregadas" 
                                                        checked={visibleMetrics.general.donacionesEntregadas}
                                                        onChange={() => toggleMetricVisibility('general', 'donacionesEntregadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showDonacionesEntregadas">
                                                        Donaciones Entregadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showTiempoRespuesta" 
                                                        checked={visibleMetrics.general.tiempoPromedioRespuesta}
                                                        onChange={() => toggleMetricVisibility('general', 'tiempoPromedioRespuesta')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showTiempoRespuesta">
                                                        Tiempo Promedio Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showTiempoEntrega" 
                                                        checked={visibleMetrics.general.tiempoPromedioEntrega}
                                                        onChange={() => toggleMetricVisibility('general', 'tiempoPromedioEntrega')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showTiempoEntrega">
                                                        Tiempo Promedio Entrega
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSolicitudesMes" 
                                                        checked={visibleMetrics.general.solicitudesPorMes}
                                                        onChange={() => toggleMetricVisibility('general', 'solicitudesPorMes')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSolicitudesMes">
                                                        Solicitudes por Mes
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showProductosMasSolicitados" 
                                                        checked={visibleMetrics.general.productosMasSolicitados}
                                                        onChange={() => toggleMetricVisibility('general', 'productosMasSolicitados')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showProductosMasSolicitados">
                                                        Productos Más Solicitados
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'solicitudes' && (
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSinResponder" 
                                                        checked={visibleMetrics.solicitudes.sinResponder}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'sinResponder')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSinResponder">
                                                        Solicitudes Sin Responder
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showAprobadas" 
                                                        checked={visibleMetrics.solicitudes.aprobadas}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'aprobadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showAprobadas">
                                                        Solicitudes Aprobadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showRechazadas" 
                                                        checked={visibleMetrics.solicitudes.rechazadas}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'rechazadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showRechazadas">
                                                        Solicitudes Rechazadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showEstadoSolicitudes" 
                                                        checked={visibleMetrics.solicitudes.estadoSolicitudes}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'estadoSolicitudes')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showEstadoSolicitudes">
                                                        Estado de Solicitudes
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSolicitudesProvincia" 
                                                        checked={visibleMetrics.solicitudes.solicitudesPorProvincia}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'solicitudesPorProvincia')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSolicitudesProvincia">
                                                        Solicitudes por Provincia
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'donaciones' && (
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showPendientes" 
                                                        checked={visibleMetrics.donaciones.pendientes}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'pendientes')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showPendientes">
                                                        Donaciones Pendientes
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showEntregadas" 
                                                        checked={visibleMetrics.donaciones.entregadas}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'entregadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showEntregadas">
                                                        Donaciones Entregadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showEstadoDonaciones" 
                                                        checked={visibleMetrics.donaciones.estadoDonaciones}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'estadoDonaciones')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showEstadoDonaciones">
                                                        Estado de Donaciones
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showInfoDonaciones" 
                                                        checked={visibleMetrics.donaciones.informacion}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'informacion')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showInfoDonaciones">
                                                        Información de Donaciones
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            
                            <div className="col-md-9">
                        <div className="tab-content">

                            
                            {activeTab === 'general' && (
                                <div>
                                            {visibleMetrics.general.solicitudesRecibidas || 
                                             visibleMetrics.general.donacionesEntregadas || 
                                             visibleMetrics.general.tiempoPromedioRespuesta || 
                                             visibleMetrics.general.tiempoPromedioEntrega ? (
                                    <div className="row g-4 mb-4">
                                                    {visibleMetrics.general.solicitudesRecibidas && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Total Solicitudes Atendidas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.totalSolicitudesRecibidas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.donacionesEntregadas && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Donaciones Entregadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesEntregadas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.tiempoPromedioRespuesta && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Tiempo Promedio Respuesta</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{formatTime(metricas.tiempoPromedioRespuesta)}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.tiempoPromedioEntrega && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4  ">
                                                    <h6 className="text-light mb-2">Tiempo Promedio Entrega</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{formatTime(metricas.tiempoPromedioEntrega)}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                    </div>
                                            ) : null}

                                    
                                            {visibleMetrics.general.solicitudesPorMes || visibleMetrics.general.productosMasSolicitados ? (
                                    <div className="row g-4">
                                                    {visibleMetrics.general.solicitudesPorMes && (
                                                        <div className={visibleMetrics.general.productosMasSolicitados ? "col-md-8" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Solicitudes por Mes</h5>
                                                    <div style={{ height: '300px' }} ref={chartRefs.monthlyChart}>
                                                        <Bar data={solicitudesPorMesData} options={chartOptions} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.productosMasSolicitados && (
                                                        <div className={visibleMetrics.general.solicitudesPorMes ? "col-md-4" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Productos Más Solicitados</h5>
                                                    <div style={{ height: '300px' }} ref={chartRefs.productsChart}>
                                                        <Pie data={productosMasSolicitadosData} options={pieChartOptions} />
                                                    </div>
                                                                    <div className="mt-3 table-responsive">
                                                                        <table className="table table-dark table-sm table-borderless">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th className="text-light">Producto</th>
                                                                                    <th className="text-end text-light">Cantidad</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {Object.entries(metricas.topProductosMasSolicitados)
                                                                                    .sort((a, b) => b[1] - a[1])
                                                                                    .map(([product, count], index) => (
                                                                                        <tr key={index}>
                                                                                            <td className="text-light">{product}</td>
                                                                                            <td className="text-end text-light">{count}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                }
                                                                            </tbody>
                                                                        </table>
                                                </div>
                                    </div>
                                </div>
                                    </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Seleccione las métricas que desea visualizar usando las opciones arriba.
                                                </div>
                                            )}
                                </div>
                            )}

                            
                            {activeTab === 'solicitudes' && (
                                <div>
                                    
                                            {visibleMetrics.solicitudes.sinResponder || 
                                             visibleMetrics.solicitudes.aprobadas || 
                                             visibleMetrics.solicitudes.rechazadas ? (
                                    <div className="row g-4 mb-4">
                                                    {visibleMetrics.solicitudes.sinResponder && (
                                        <div className="col-md-4">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Solicitudes Sin Responder</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.solicitudesSinResponder}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.solicitudes.aprobadas && (
                                        <div className="col-md-4">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Solicitudes Aprobadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.solicitudesAprobadas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.solicitudes.rechazadas && (
                                        <div className="col-md-4">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Solicitudes Rechazadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.solicitudesRechazadas}</p>
                                    </div>
                                </div>
                            </div>
                                                    )}
                        </div>
                                            ) : null}

                                    
                                            {visibleMetrics.solicitudes.estadoSolicitudes || visibleMetrics.solicitudes.solicitudesPorProvincia ? (
                                    <div className="row g-4">
                                                    {visibleMetrics.solicitudes.estadoSolicitudes && (
                                                        <div className={visibleMetrics.solicitudes.solicitudesPorProvincia ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Estado de Solicitudes</h5>
                                                    <div style={{ height: '300px' }} ref={chartRefs.solicitudesStatusChart}>
                                                        <Pie data={solicitudesStatusData} options={pieChartOptions} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.solicitudes.solicitudesPorProvincia && (
                                                        <div className={visibleMetrics.solicitudes.estadoSolicitudes ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light ">Solicitudes por Provincia</h5>
                                                    <div style={{ height: '300px' }} ref={chartRefs.provincesChart}>
                                                        <Bar data={solicitudesPorProvinciaData} options={chartOptions} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                    </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Seleccione las métricas que desea visualizar usando las opciones arriba.
                                                </div>
                                            )}
                                </div>
                            )}

                            
                            {activeTab === 'donaciones' && (
                                <div>
                                    
                                            {visibleMetrics.donaciones.pendientes || visibleMetrics.donaciones.entregadas ? (
                                    <div className="row g-4 mb-4">
                                                    {visibleMetrics.donaciones.pendientes && (
                                        <div className="col-md-6">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Donaciones Pendientes</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesPendientes}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.donaciones.entregadas && (
                                        <div className="col-md-6">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Donaciones Entregadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesEntregadas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                    </div>
                                            ) : null}

                                    
                                            {visibleMetrics.donaciones.estadoDonaciones || visibleMetrics.donaciones.informacion ? (
                                    <div className="row g-4">
                                                    {visibleMetrics.donaciones.estadoDonaciones && (
                                                        <div className={visibleMetrics.donaciones.informacion ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Estado de Donaciones</h5>
                                                    <div style={{ height: '300px' }} ref={chartRefs.donacionesStatusChart}>
                                                        <Pie data={donacionesStatusData} options={pieChartOptions} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.donaciones.informacion && (
                                                        <div className={visibleMetrics.donaciones.estadoDonaciones ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Información de Donaciones</h5>
                                                    <table className="table table-dark table-borderless">
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-light">Tiempo Promedio de Entrega</td>
                                                                <td className="text-end text-light">{formatTime(metricas.tiempoPromedioEntrega)}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-light"></td>
                                                                <td className="text-end text-light">{metricas.donacionesPorProvincia} </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                    </div>
                                </div>
                                                    )}
                                    </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Seleccione las métricas que desea visualizar usando las opciones arriba.
                                </div>
                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricasComponent;
