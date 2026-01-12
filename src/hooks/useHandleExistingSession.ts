import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setToken, setRecordId, setTicketNumber } from "src/store/userAuthSlice";

// Типы можно вынести в отдельный файл types.ts, если они используются в API
export interface BackendRecord {
  recordId: number;
  ticketNumber: number;
  clientNumber: number;
  statusId: number;
  serviceNameRu: string;
  serviceNameKk: string;
  serviceNameEn: string;
  windowNumber: number;
  [key: string]: any; // для остальных полей
}

export interface LoginResponse {
  record: BackendRecord;
  token: string;
}

export const useHandleExistingSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Используем useCallback, чтобы функция не пересоздавалась при каждом рендере
  const handleExistingSession = useCallback((data: LoginResponse) => {
    const { record, token } = data;

    if (!record || !token) {
        console.warn("handleExistingSession: Нет записи или токена");
        return;
    }

    // 1. Сохраняем Токен
    dispatch(setToken(token));
    localStorage.setItem("token", token);
    
    // 2. Сохраняем RecordId
    dispatch(setRecordId(record.recordId));
    localStorage.setItem("recordId", String(record.recordId));

    // 3. Сохраняем TicketNumber
    dispatch(setTicketNumber(record.ticketNumber));
    localStorage.setItem("ticketNumber", String(record.ticketNumber));

    // 4. Восстанавливаем объект "selectedService" для корректной работы других страниц
    const serviceObjectForStorage = {
      id: null, 
      name: record.serviceNameRu, 
      description: record.serviceNameRu,
      nameRu: record.serviceNameRu,
      nameKk: record.serviceNameKk,
      nameEn: record.serviceNameEn,
    };
    localStorage.setItem("selectedService", JSON.stringify(serviceObjectForStorage));

    // 5. Умный редирект в зависимости от статуса

    
    switch (record.statusId) {
      case 3: // Вызван к окну
        navigate("/call", { replace: true });
        break;
      case 4: // Обслуживается
        navigate("/progress", { replace: true });
        break;
      case 6: // Завершен (на всякий случай)
        navigate("/rating", { replace: true });
        break;
      default: // 1 - Ожидание и любые другие
        navigate("/wait", { replace: true });
        break;
    }
  }, [dispatch, navigate]);

  return { handleExistingSession };
};