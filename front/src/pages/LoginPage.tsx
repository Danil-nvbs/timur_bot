import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { formatPhoneDisplay, formatPhoneNumber, validatePhoneNumber } from '../utils/phoneUtils';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [displayPhone, setDisplayPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ... существующие методы handlePhoneChange и handleSendOtp ...

  const handleVerifyOtp = async () => {
    if (!code.trim()) {
      setError('Введите код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 Отправляем запрос на проверку OTP:', phone, code);
      const response = await apiService.verifyOtp(phone, code);
      console.log('✅ OTP проверка успешна:', response);
      
      // Сохраняем токен и пользователя
      login(response.access_token, response.user);
      
      // Перенаправляем на главную страницу админки
      navigate('/');
      
    } catch (err: any) {
      console.error('❌ Ошибка проверки OTP:', err);
      setError(err.response?.data?.message || 'Неверный код');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePhoneChange = (value: string) => {
    // Убираем все кроме цифр и ограничиваем длину
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    
    // Форматируем для отображения
    let formatted = '';
    if (numbers.length > 0) {
      if (numbers.startsWith('7') || numbers.startsWith('8')) {
        formatted = `+7 (${numbers.slice(1, 4)}`;
        if (numbers.length > 4) {
          formatted += `) ${numbers.slice(4, 7)}`;
        }
        if (numbers.length > 7) {
          formatted += `-${numbers.slice(7, 9)}`;
        }
        if (numbers.length > 9) {
          formatted += `-${numbers.slice(9)}`;
        }
      } else {
        formatted = `+7 (${numbers.slice(0, 3)}`;
        if (numbers.length > 3) {
          formatted += `) ${numbers.slice(3, 6)}`;
        }
        if (numbers.length > 6) {
          formatted += `-${numbers.slice(6, 8)}`;
        }
        if (numbers.length > 8) {
          formatted += `-${numbers.slice(8)}`;
        }
      }
    }
    
    setDisplayPhone(formatted);
    setPhone(formatPhoneNumber(formatted));
  };

  const handleSendOtp = async () => {
    if (!phone || !validatePhoneNumber(phone)) {
      setError('Введите корректный номер телефона');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      console.log('📤 Отправляем запрос на OTP для телефона:', phone);
      await apiService.sendOtp(phone);
      console.log('✅ OTP запрос успешен');
      setOtpSent(true);
      setStep(1);
    } catch (err: any) {
      console.error('❌ Ошибка отправки OTP:', err);
      setError(err.response?.data?.message || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Ввод номера телефона', 'Подтверждение кода'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🛒 Bot Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Вход в панель администратора
          </Typography>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 0 && (
          <Box>
            <TextField
              fullWidth
              label="Номер телефона"
              value={displayPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              sx={{ mb: 3 }}
              disabled={loading}
              helperText="Введите номер телефона в формате +7 (999) 123-45-67"
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSendOtp}
              disabled={loading || !phone || !validatePhoneNumber(phone)}
            >
              {loading ? <CircularProgress size={24} /> : 'Отправить код'}
            </Button>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Код отправлен на номер {formatPhoneDisplay(phone)}. Проверьте Telegram.
            </Typography>
            <TextField
              fullWidth
              label="Код подтверждения"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              sx={{ mb: 3 }}
              disabled={loading}
              inputProps={{ maxLength: 6 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStep(0);
                  setOtpSent(false);
                  setCode('');
                  setError('');
                }}
                disabled={loading}
              >
                Назад
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={loading || !code.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Войти'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LoginPage;