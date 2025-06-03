import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { fetchSeguimientos } from "../../../Services/seguimientoService.js"; // Asegurate de importar esto

const SeguimientoWebSocketListener = ({ onRecargarSeguimientos }) => {
    useEffect(() => {
        const client = new Client({
            brokerURL: "wss://dasalas.shop:8443/ws",
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("🟢 Conectado a WebSocket");

                client.subscribe("/topic/donacion-actualizada", async () => {
                    console.log("📥 Notificación de actualización recibida");

                    try {
                        const nuevos = await fetchSeguimientos();
                        onRecargarSeguimientos(nuevos);
                    } catch (error) {
                        console.error("❌ Error al recargar seguimientos:", error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP Error:", frame);
            }
        });

        client.activate();

        return () => client.deactivate();
    }, [onRecargarSeguimientos]);

    return null;
};

export default SeguimientoWebSocketListener;