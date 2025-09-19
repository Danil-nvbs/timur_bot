// front/src/utils/phoneUtils.ts
export const formatPhoneNumber = (value: string): string => {
    // Убираем все кроме цифр
    const numbers = value.replace(/\D/g, '');
    
    // Если начинается с 7, оставляем как есть
    if (numbers.startsWith('7') && numbers.length === 11) {
      return numbers;
    }
    
    // Если начинается с 8, заменяем на 7
    if (numbers.startsWith('8') && numbers.length === 11) {
      return `7${numbers.slice(1)}`;
    }
    
    // Если 10 цифр, добавляем 7
    if (numbers.length === 10) {
      return `7${numbers}`;
    }
    
    return numbers;
  };
  
  export const formatPhoneDisplay = (phone: string): string => {
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11 && numbers.startsWith('7')) {
      return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9)}`;
    }
    
    return phone;
  };
  
  export const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };
  
  export const validatePhoneNumber = (phone: string): boolean => {
    const numbers = cleanPhoneNumber(phone);
    return numbers.length === 11 && (numbers.startsWith('7') || numbers.startsWith('8'));
  };