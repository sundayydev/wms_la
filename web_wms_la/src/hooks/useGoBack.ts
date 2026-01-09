import { useNavigate } from 'react-router-dom';

export const useGoBack = () => {
    const navigate = useNavigate();

    // Nhận vào fallbackUrl, mặc định là trang chủ '/'
    const goBack = (fallbackUrl = '/') => {
        // Kiểm tra xem có state trong history không (thường > 0 nghĩa là có lịch sử)
        // Lưu ý: window.history.state.idx là chỉ số index nội bộ của router
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            // Nếu không có lịch sử, điều hướng về trang fallback
            navigate(fallbackUrl, { replace: true });
        }
    };

    return goBack;
};