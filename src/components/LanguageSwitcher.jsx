// src/components/LanguageSwitcher.jsx
import { Select } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const handleChange = (e) => i18n.changeLanguage(e.target.value);

  return (
    <Select value={i18n.language} onChange={handleChange} size="sm" w="150px">
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="es">Español</option>
      <option value="de">Deutsch</option>
      <option value="zh">中文</option>
      <option value="ja">日本語</option>
      <option value="ar">العربية</option>
      <option value="pt">Português</option>
      <option value="ru">Русский</option>
      <option value="hi">हिंदी</option>
    </Select>
  );
};

export default LanguageSwitcher;
