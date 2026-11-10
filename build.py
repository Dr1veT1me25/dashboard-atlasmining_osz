import pandas as pd
import json
import os
import glob
import base64
import lzstring
import re
import datetime

# Настройки имен файлов
HTML_FILE = 'index.html'
CSS_FILE = 'style.css'
JS_FILE = 'script.js'
CHART_JS = 'chart.js'
XLSX_JS = 'xlsx.full.min.js'
EXCELJS_JS = 'exceljs.min.js'
FILESAVER_JS = 'FileSaver.min.js'
LZ_JS = 'lz-string.min.js'
DATA_1C = 'data_1c.xlsx'
DATA_1C_PERENOS = 'data_1c_perenos.xlsx'
DATA_1C_SOGLASOVANIE = 'data_1c_soglasovanie.xlsx'
DATA_ZAKUP_SOGLAS = 'data_zakup_soglasovanie.xlsx'
DIADOK_FOLDER = 'Diadok_data'
DTZ_FILE = 'data_dtz.xlsx'
SED_FOLDER = 'SED_data'
EDO_FOLDER = 'EDO_data'
ARCHIVE_FILE = 'achievements_archive.json'

VACATION_FILE = 'data_vacations.xls' # Имя файла с отпусками
OUTPUT_FILE = 'dashboard.html'

def load_excel_to_json(filename, date_columns=[]):
    """Читает файл 1С и возвращает список словарей"""
    if not os.path.exists(filename):
        print(f"⚠️ Файл {filename} не найден.")
        return []
    try:
        df = pd.read_excel(filename)
        for col in date_columns:
            for c in df.columns:
                if col.lower() in c.lower():
                    df[c] = df[c].astype(str).replace('NaT', '').replace('nan', '')
        df = df.fillna('')
        return df.to_dict(orient='records')
    except Exception as e:
        print(f"❌ Ошибка при чтении {filename}: {e}")
        return []

def parse_perenos_file(filename):
    """Специальный парсер для отчета 'История изменения реквизитов документов'"""
    if not os.path.exists(filename):
        print(f"⚠️ Файл {filename} не найден.")
        return []
    try:
        df = pd.read_excel(filename, skiprows=6)
        
        cols = df.columns
        date_col = next((c for c in cols if 'Дата' in str(c)), None)
        user_col = next((c for c in cols if 'Пользователь' in str(c)), None)
        
        # Новые колонки
        doc_emp_col = next((c for c in cols if 'документ.ответственный' in str(c).lower() or 'документ. ответственный' in str(c).lower()), None)
        doc_num_col = next((c for c in cols if str(c).strip().lower() == 'документ'), None)
        old_date_col = next((c for c in cols if 'старое значение' in str(c).lower()), None)
        new_date_col = next((c for c in cols if 'новое значение' in str(c).lower()), None)
        reason_col = next((c for c in cols if 'причина' in str(c).lower()), None)
        predmet_col = next((c for c in cols if 'номенклатура' in str(c).lower() or 'предмет' in str(c).lower()), None)

        if not date_col or not user_col:
            print(f"❌ В файле {filename} не найдены основные колонки.")
            return []

        df = df.dropna(subset=[date_col, user_col])
        
        result = []
        for _, row in df.iterrows():
            date_val = row[date_col]
            if pd.isna(date_val): continue
            
            try:
                date_str = pd.to_datetime(date_val, dayfirst=True).strftime('%Y-%m-%d')
            except:
                continue
                
            user_name = str(row[user_col]).strip()
            doc_type = "Перенос срока поставки"
            
            # Новые поля
            doc_emp = str(row[doc_emp_col]).strip() if doc_emp_col and pd.notna(row[doc_emp_col]) else user_name
            doc_num = str(row[doc_num_col]).strip() if doc_num_col and pd.notna(row[doc_num_col]) else ""
            old_d = str(row[old_date_col]).split(' ')[0] if old_date_col and pd.notna(row[old_date_col]) else ""
            new_d = str(row[new_date_col]).split(' ')[0] if new_date_col and pd.notna(row[new_date_col]) else ""
            reason = str(row[reason_col]).strip() if reason_col and pd.notna(row[reason_col]) else "Не указана"
            predmet = str(row[predmet_col]).strip() if predmet_col and pd.notna(row[predmet_col]) else "Без названия"
            
            # Считаем разницу в днях
            diff_days = 0
            if old_d and new_d:
                try:
                    dt1 = pd.to_datetime(old_d, dayfirst=True)
                    dt2 = pd.to_datetime(new_d, dayfirst=True)
                    diff_days = (dt2 - dt1).days
                    
                    # ЗАЩИТА ОТ ОПЕЧАТОК В ДАТАХ (если больше 730 дней или отрицательно)
                    if diff_days > 730 or diff_days < 0:
                        diff_days = 0
                except: pass

            result.append({
                "Дата": date_str,
                "Тип": doc_type,
                "Ответственный": user_name,
                "Номер": "",
                "DocResponsible": doc_emp,
                "OldDate": old_d,
                "NewDate": new_d,
                "DiffDays": diff_days,
                "Reason": reason,
                "Predmet": predmet,
                "DocumentNumber": doc_num
            })
            
        print(f"✅ Загружено {len(result)} строк из {filename} (Перенос сроков).")
        return result
    except Exception as e:
        print(f"❌ Ошибка при чтении {filename}: {e}")
        return []

def parse_soglasovanie_file(filename):
    """Парсер для документа 'Согласование строк потребности'"""
    if not os.path.exists(filename):
        print(f"⚠️ Файл {filename} не найден.")
        return []
    try:
        df = pd.read_excel(filename)
        cols = df.columns
        
        date_col = next((c for c in cols if 'Дата окончания' in str(c)), None)
        user_col = next((c for c in cols if 'Исполнитель' in str(c)), None)
        days_col = next((c for c in cols if 'дней' in str(c).lower()), None)
        org_col = next((c for c in cols if 'организац' in str(c).lower()), None)
        
        # Ищем колонку с названием предмета
        predmet_col = next((c for c in cols if 'предмет' in str(c).lower()), None)

        # ... (проверки) ...
        
        if not date_col or not user_col:
            print(f"❌ В файле {filename} не найдены нужные колонки.")
            return []

        df = df.dropna(subset=[date_col, user_col])
        
        result = []
        for _, row in df.iterrows():
            date_val = row[date_col]
            if pd.isna(date_val): continue
            
            try:
                date_str = pd.to_datetime(date_val, dayfirst=True).strftime('%Y-%m-%d')
            except:
                continue
            predmet_text = str(row[predmet_col]).strip() if predmet_col and pd.notna(row[predmet_col]) else "Не указан"
                
            user_name = str(row[user_col]).strip()
            doc_type = "Согласование строк потребности"
            
            days_val = 0
            if days_col and pd.notna(row[days_col]):
                try:
                    days_val = int(float(str(row[days_col]).replace(',', '.').strip()))
                except:
                    pass
            
            # Берем организацию из новой колонки
            org_name = str(row[org_col]).strip() if org_col and pd.notna(row[org_col]) else "Не указана"
            predmet_text = str(row['Предмет']).strip() if 'Предмет' in df.columns else "Не указан"
            result.append({
                "Дата": date_str,
                "Тип": doc_type,
                "Ответственный": user_name,
                "Номер": "",
                "Дней согласования": days_val,
                "Organization": org_name, # <-- ПЕРЕДАЕМ ОРГАНИЗАЦИЮ
                "Predmet": predmet_text
            })
            
        print(f"✅ Загружено {len(result)} строк из {filename} (Согласования).")
        return result
    except Exception as e:
        print(f"❌ Ошибка при чтении {filename}: {e}")
        return []

def parse_sed_files():
    """Читает все файлы из папки SED_data и извлекает таблицы"""
    if not os.path.exists(SED_FOLDER):
        os.makedirs(SED_FOLDER)
        return []

    all_sed_data = []
    files = glob.glob(os.path.join(SED_FOLDER, '*.xlsx')) + glob.glob(os.path.join(SED_FOLDER, '*.xls'))
    if not files: return []

    print(f"🔍 Найдено {len(files)} отчетов СЭД. Начинаем парсинг...")

    for file_path in files:
        try:
            filename = os.path.basename(file_path)
            emp_name = os.path.splitext(filename)[0].strip()
            emp_name = emp_name.replace("Отчет", "").replace("отчет", "").replace("_", " ").strip()
            
            df = pd.read_excel(file_path, header=None)
            
            # Если имя не взялось из файла, ищем в тексте
            if not emp_name:
                for i in range(min(15, len(df))):
                    row_text = str(df.iloc[i, 0])
                    if "Сотрудник" in row_text:
                        name_part = row_text.split("Сотрудник")[1].replace(":", "").strip()
                        emp_name = name_part.split("(")[0].strip() if "(" in name_part else name_part
                        break

            header_row_idx = -1
            for i in range(min(20, len(df))):
                row_str = " ".join([str(x) for x in df.iloc[i].values])
                if "Тема" in row_str or "Автор задачи" in row_str:
                    header_row_idx = i
                    break
            
            if header_row_idx == -1: continue

            df_data = df.iloc[header_row_idx + 1:].copy()
            df_data.columns = df.iloc[header_row_idx] 
            
            rename_map = {}
            for col in df_data.columns:
                col_str = str(col).lower()
                if 'создано' in col_str: rename_map[col] = 'Создано'
                elif 'срок' in col_str and 'нарушен' not in col_str: rename_map[col] = 'Срок'
                elif 'выполнено' in col_str and 'другим' not in col_str: rename_map[col] = 'Выполнено'
                elif 'задержка' in col_str: rename_map[col] = 'Задержка, раб.дней'
            
            df_data = df_data.rename(columns=rename_map)
            df_data['Сотрудник'] = emp_name
            df_data = df_data.dropna(subset=['Тема'])
            
            for date_col in ['Создано', 'Срок', 'Выполнено']:
                if date_col in df_data.columns:
                    df_data[date_col] = df_data[date_col].astype(str).replace('NaT', '').replace('nan', '')

            df_data = df_data.fillna('')
            records = df_data.to_dict(orient='records')
            all_sed_data.extend(records)
            print(f"  ✅ {emp_name}: {len(records)} задач.")
        except Exception as e:
            print(f"  ❌ Ошибка в {filename}: {e}")

    return all_sed_data

def parse_vacations(filename=VACATION_FILE):
    target_employees = [
        "Родионова Ольга Вячеславовна", "Дашкевич Алина Максимовна", "Полищук Татьяна Николаевна",
        "Карпова Наталья Викторовна", "Абакумов Дмитрий Алексеевич", "Кононов Олег Викторович",
        "Перчук Анастасия Дмитриевна", "Игнатюк Яна Сергеевна", "Васильева Татьяна Владимировна",
        "Плигина Мария Валерьевна"
    ]
    
    name_map = {"Перчук Анастасия Дмитриевна": "Кононова Анастасия Дмитриевна"}

    if not os.path.exists(filename):
        print(f"⚠️ Файл {filename} не найден.")
        return [], []

    # Создаем словарь со всеми сотрудниками, по умолчанию с нулями
    summary_dict = {name_map.get(n, n): {"total": 0.0, "planned": 0.0, "remaining": 0.0, "by_schedule": 0.0} for n in target_employees}
    vacations = []

    def safe_float(val):
        if pd.isna(val): return 0.0
        s = str(val).replace(',', '.').strip()
        if s == '' or s == '-': return 0.0
        try:
            return float(s)
        except:
            return 0.0

    try:
        # Читаем файл без пропусков, чтобы найти строку с заголовками
        df = pd.read_excel(filename, header=None, dtype=object)
        
        # Ищем строку с заголовками (где есть слова "Запланировано" и "Остаток на конец года")
        header_row_idx = -1
        for i in range(5):
            row_str = " ".join([str(x) for x in df.iloc[i].values if pd.notna(x)])
            if "Запланировано" in row_str and "Остаток на конец года" in row_str:
                header_row_idx = i
                break
        
        if header_row_idx == -1:
            print("❌ Не удалось найти строку с заголовками в файле отпусков.")
            return [], []

        # Определяем индексы нужных колонок
        headers = df.iloc[header_row_idx].values
        idx_reserve = -1
        idx_remaining = -1
        idx_planned = -1
        
        for i, h in enumerate(headers):
            if pd.isna(h): continue
            h_str = str(h).strip().lower()
            if "резерв" in h_str: idx_reserve = i
            elif "остаток" in h_str: idx_remaining = i
            elif "запланировано" in h_str: idx_planned = i

        # Если не нашли по названиям, берем жестко по индексам (D=3, BA=52, BB=53)
        if idx_reserve == -1: idx_reserve = 3
        if idx_remaining == -1: idx_remaining = 52
        if idx_planned == -1: idx_planned = 53

        # Начинаем читать данные со следующей строки после заголовков
        for index in range(header_row_idx + 1, len(df)):
            row = df.iloc[index]
            if pd.isna(row[0]): continue
            
            name = str(row[0]).strip()
            if name in target_employees:
                final_name = name_map.get(name, name)
                schedule_days = 0
                
                # 1. Сбор всех периодов отпуска
                for col_idx in range(4, len(row) - 1, 4):
                    start_val = row[col_idx]
                    end_val = row[col_idx + 1]
                    
                    if pd.notna(start_val) and pd.notna(end_val):
                        try:
                            start_dt = pd.to_datetime(start_val, dayfirst=True)
                            end_dt = pd.to_datetime(end_val, dayfirst=True)
                            vacations.append({
                                "name": final_name,
                                "start": start_dt.strftime('%Y-%m-%d'),
                                "end": end_dt.strftime('%Y-%m-%d')
                            })
                            # Считаем календарные дни для проверки (включая первый и последний день)
                            schedule_days += (end_dt - start_dt).days + 1
                        except Exception:
                            pass 

                # 2. Сбор статистики
                try:
                    reserve = safe_float(row[idx_reserve])
                    remaining = safe_float(row[idx_remaining])
                    planned = safe_float(row[idx_planned])
                    
                    # На начало года = Запланировано + Остаток
                    total_available = planned + remaining
                    
                    summary_dict[final_name] = {
                        "total": round(total_available, 1),
                        "planned": round(planned, 1),
                        "remaining": round(remaining, 1),
                        "by_schedule": schedule_days
                    }
                except Exception as e:
                    pass

        # Превращаем словарь обратно в список
        summary = [{"name": k, **v} for k, v in summary_dict.items()]

        print(f"✅ Загружено {len(vacations)} периодов отпусков для {len(summary)} сотрудников.")
        return vacations, summary

    except Exception as e:
        print(f"❌ Ошибка при чтении файла отпусков: {e}")
        return [], []

def parse_edo_files():
    if not os.path.exists(EDO_FOLDER): return []
    files = glob.glob(os.path.join(EDO_FOLDER, '*.xlsx')) + glob.glob(os.path.join(EDO_FOLDER, '*.xls'))
    if not files: return []

    all_data = []
    print(f"🔍 Найдено {len(files)} файлов ЭДО. Начинаем парсинг...")

    for file_path in files:
        try:
            df_temp = pd.read_excel(file_path, header=None, nrows=15)
            header_row = -1
            for i in range(len(df_temp)):
                row_str = " ".join(str(val) for val in df_temp.iloc[i].values)
                if 'Организация' in row_str and ('Контрагент' in row_str or 'ИНН' in row_str):
                    header_row = i
                    break
            if header_row == -1: continue

            df = pd.read_excel(file_path, header=header_row)
            cols = df.columns
            
            org_col = next((c for c in cols if 'организац' in str(c).lower()), None)
            # Ищем колонку контрагента (может называться "Контрагент" или "Контрагент, ИНН")
            cont_col = next((c for c in cols if 'контрагент' in str(c).lower()), None)
            channel_col = next((c for c in cols if 'канал' in str(c).lower()), None)
            date_col = next((c for c in cols if 'дата' in str(c).lower()), None)

            if not org_col or not cont_col or not channel_col or not date_col: continue

            df = df[[date_col, org_col, cont_col, channel_col]].copy()
            df.columns = ['Дата', 'Организация', 'Контрагент_ИНН', 'Канал']
            
            df = df.dropna(subset=['Канал', 'Дата'])
            df['Организация'] = df['Организация'].ffill()
            df['Контрагент_ИНН'] = df['Контрагент_ИНН'].ffill()

            for col in df.columns:
                df[col] = df[col].astype(str).str.strip()

            df['Дата'] = pd.to_datetime(df['Дата'], dayfirst=True, errors='coerce').dt.strftime('%Y-%m-%d')
            df = df.dropna(subset=['Дата'])

            records = df[['Дата', 'Организация', 'Контрагент_ИНН', 'Канал']].values.tolist()
            all_data.extend(records)
        except Exception as e:
            pass
    return all_data

    # Объединяем все данные
    full_df = pd.concat(all_data, ignore_index=True)

    # 1. Определяем ГЛОБАЛЬНЫЙ статус каждого контрагента
    # Считаем, сколько у него всего ЭДО и Бумаги по всем БЕ
    cont_stats = full_df.groupby(['Контрагент', 'Канал']).size().unstack(fill_value=0)
    
    # Убедимся, что колонки ЭДО и Бумага существуют
    if 'ЭДО' not in cont_stats.columns: cont_stats['ЭДО'] = 0
    if 'Бумага' not in cont_stats.columns: cont_stats['Бумага'] = 0

    # Логика: если ЭДО > Бумага, статус 'Электронный', иначе 'Бумажный'
    cont_stats['Статус'] = cont_stats.apply(lambda row: 'Электронный' if row['ЭДО'] > row['Бумага'] else 'Бумажный', axis=1)
    
    # Краткий словарь статусов контрагентов
    contractor_status = cont_stats['Статус'].to_dict()
    
    # Общее количество контрагентов по статусам
    total_electronic = sum(1 for s in contractor_status.values() if s == 'Электронный')
    total_paper = sum(1 for s in contractor_status.values() if s == 'Бумажный')
    total_contractors = total_electronic + total_paper
    edo_share = round((total_electronic / total_contractors) * 100, 1) if total_contractors > 0 else 0

    # 2. Статистика по Бизнес-Единицам (БЕ)
    # Добавляем статус контрагента к каждой строке
    full_df['Статус_контрагента'] = full_df['Контрагент'].map(contractor_status)

    # Считаем уникальных контрагентов по БЕ и их статусам
    bu_stats = full_df.groupby(['Организация', 'Статус_контрагента'])['Контрагент'].nunique().unstack(fill_value=0)
    
    if 'Электронный' not in bu_stats.columns: bu_stats['Электронный'] = 0
    if 'Бумажный' not in bu_stats.columns: bu_stats['Бумажный'] = 0
    
    bu_dict = bu_stats.to_dict(orient='index')

    # 3. Формируем список бумажных контрагентов для таблицы
    paper_contractors_list = []
    for cont, row in cont_stats.iterrows():
        if row['Статус'] == 'Бумажный':
            # Узнаем, с какими БЕ он работает
            bes = full_df[full_df['Контрагент'] == cont]['Организация'].unique().tolist()
            paper_contractors_list.append({
                'name': cont,
                'edo_count': int(row['ЭДО']),
                'paper_count': int(row['Бумага']),
                'total': int(row['ЭДО'] + row['Бумага']),
                'bes': bes
            })

    # Сортируем по убыванию бумажных документов
    paper_contractors_list = sorted(paper_contractors_list, key=lambda x: x['paper_count'], reverse=True)

    return {
        'kpi': {
            'total': total_contractors,
            'electronic': total_electronic,
            'paper': total_paper,
            'edo_share': edo_share
        },
        'bu_stats': bu_dict,
        'paper_contractors': paper_contractors_list
    }
def parse_diadok_files():
    """Читает CSV файлы из папки Diadok_data и собирает справочник по ИНН"""
    if not os.path.exists(DIADOK_FOLDER):
        print(f"⚠️ Папка {DIADOK_FOLDER} не найдена.")
        return {}

    files = glob.glob(os.path.join(DIADOK_FOLDER, '*.csv'))
    if not files:
        print(f"⚠️ В папке {DIADOK_FOLDER} нет CSV файлов.")
        return {}

    diadok_dict = {} # { ИНН: { name, id } }
    print(f"🔍 Найдено {len(files)} файлов Диадок. Начинаем парсинг...")

    for file_path in files:
        try:
            # Читаем CSV. Разделитель может быть точкой с запятой или запятой.
            try:
                df = pd.read_csv(file_path, sep=';', dtype=str, encoding='utf-8')
            except:
                df = pd.read_csv(file_path, sep=',', dtype=str, encoding='utf-8')
            
            # Ищем нужные колонки
            name_col = next((c for c in df.columns if 'название' in str(c).lower()), None)
            inn_col = next((c for c in df.columns if 'инн' in str(c).lower()), None)
            id_col = next((c for c in df.columns if 'идентификатор' in str(c).lower()), None)

            if not inn_col:
                print(f"  ❌ В {os.path.basename(file_path)} нет колонки ИНН.")
                continue

            count = 0
            for _, row in df.iterrows():
                # Очищаем ИНН от лишних символов
                raw_inn = str(row[inn_col]).strip()
                # Если Эксель превратил в экспоненту (2,7201E+11) - мы не сможем восстановить, 
                # но если это просто текст с пробелами - очистим.
                clean_inn = ''.join(filter(str.isdigit, raw_inn))
                
                if clean_inn and len(clean_inn) in [10, 12]:
                    name = str(row[name_col]).strip() if name_col else "Неизвестно"
                    d_id = str(row[id_col]).strip() if id_col else ""
                    
                    # Дедупликация: если ИНН уже есть, просто добавляем ID ящика через запятую
                    if clean_inn in diadok_dict:
                        if d_id and d_id not in diadok_dict[clean_inn]['ids']:
                            diadok_dict[clean_inn]['ids'].append(d_id)
                    else:
                        diadok_dict[clean_inn] = {'name': name, 'ids': [d_id] if d_id else []}
                        count += 1
                        
            print(f"  ✅ {os.path.basename(file_path)}: загружено {count} уникальных контрагентов.")
        except Exception as e:
            print(f"  ❌ Ошибка в {os.path.basename(file_path)}: {e}")

    # Преобразуем списки ID в строку
    for inn in diadok_dict:
        diadok_dict[inn]['id_string'] = ', '.join(diadok_dict[inn]['ids'])
        
    return diadok_dict

def parse_dtz_files(filename=DTZ_FILE):
    """Парсит основную таблицу ДтЗ и лист 'Статистика'"""
    if not os.path.exists(filename):
        print(f"⚠️ Файл {filename} не найден.")
        return [], {}, ""

    try:
        df_main = pd.read_excel(filename, sheet_name='ДтЗ', skiprows=4)
        df_main.columns = [str(c).strip() for c in df_main.columns]
        
        dtz_col = next((c for c in df_main.columns if 'дтз' in str(c).lower() or 'сумма' in str(c).lower()), None)
                # Ищем колонку с комментариями (сначала по названию, потом жестко 23-ю)
        comment_col = next((c for c in df_main.columns if 'коммент' in str(c).lower()), None)
        if not comment_col and len(df_main.columns) > 22:
            comment_col = df_main.columns[22] # 23-я колонка (индекс 22)

        if not dtz_col:
            print("❌ Колонка с суммой ДтЗ не найдена.")
            return [], {}, ""

        df_main = df_main.dropna(subset=[dtz_col])
        
        def clean_money(val):
            if pd.isna(val): return 0.0
            s = str(val).replace(' ', '').replace(',', '.')
            try: return float(s)
            except: return 0.0

        import re 

        dtz_records = []
        for _, row in df_main.iterrows():
            # Вытаскиваем дату заказа из текста
            order_text = str(row.get('Заказ поставщику', ''))
            order_date_str = ''
            match = re.search(r'от\s+(\d{2}\.\d{2}\.\d{4})', order_text)
            if match:
                parts = match.group(1).split('.')
                order_date_str = f"{parts[2]}-{parts[1]}-{parts[0]}"

            # Вытаскиваем срок поставки
            raw_deadline = row.get('Расчетный срок поставки', '')
            deadline_str = ''
            if pd.notna(raw_deadline):
                try:
                    deadline_str = pd.to_datetime(raw_deadline, dayfirst=True).strftime('%Y-%m-%d')
                except:
                    deadline_str = str(raw_deadline)

            dtz_records.append([
                str(row.get('Организация', 'Не указана')).strip(),
                str(row.get('Контрагент', 'Не указан')).strip(),
                str(row.get('Ответственный', 'Не указан')).strip(),
                str(row.get('ТИП2', 'Не указан')).strip(),
                str(row.get('Куратор ДтЗ', 'Не указан')).strip(),
                str(row.get('Способ закрытия', 'Не заполнено')).strip(),
                "", # <-- Индекс 6: Вид задолженности (из Excel больше не берем)
                deadline_str,       # <-- Индекс 7: Срок поставки (YYYY-MM-DD)
                clean_money(row.get(dtz_col, 0)), # <-- Индекс 8: Сумма
                order_text.strip(), # <-- Индекс 9: Текст заказа
                str(row.get('Департамент', 'Не указан')).strip(), # <-- Индекс 10: Департамент
                order_date_str,      # <-- Индекс 11: Дата заказа (YYYY-MM-DD)
                str(row.get(comment_col, '')).strip() if comment_col and pd.notna(row.get(comment_col)) else "" # <-- Очистили от nan
            ])

        # Статистика
        df_stat = pd.read_excel(filename, sheet_name='Статистика', header=None, nrows=4)
        
        dates, sums, counts = [], [], []
        
        for col_idx in range(1, 55):
            date_val = df_stat.iloc[1, col_idx]
            if pd.isna(date_val): continue
            
            try:
                if isinstance(date_val, (int, float)):
                    d_str = (pd.to_datetime('1899-12-30') + pd.to_timedelta(date_val, unit='d')).strftime('%Y-%m-%d')
                else:
                    d_str = pd.to_datetime(date_val, dayfirst=True).strftime('%Y-%m-%d')
                dates.append(d_str)
            except:
                continue
                
            raw_sum = str(df_stat.iloc[2, col_idx]).strip()
            s_clean = 0.0
            if 'млрд' in raw_sum:
                s_clean = float(raw_sum.replace(' млрд ₽', '').replace(',', '.')) * 1_000_000_000
            elif 'млн' in raw_sum:
                s_clean = float(raw_sum.replace(' млн ₽', '').replace(',', '.')) * 1_000_000
            else:
                try: s_clean = float(raw_sum.replace(' ', '').replace(',', '.'))
                except: pass
            sums.append(s_clean)
            
            try:
                counts.append(int(float(str(df_stat.iloc[3, col_idx]).replace(',', '.'))))
            except:
                counts.append(0)
                
        stats_data = {"dates": dates, "sums": sums, "counts": counts}
        
        # Берем дату выгрузки из ПОСЛЕДНЕЙ колонки в массиве дат
        report_date_str = "Не указана"
        if dates:
            try:
                last_d = pd.to_datetime(dates[-1])
                report_date_str = last_d.strftime('%d.%m.%Y')
            except:
                pass

        print(f"✅ Загружено ДтЗ: {len(dtz_records)} строк. Дата среза: {report_date_str}.")
        return dtz_records, stats_data, report_date_str

    except Exception as e:
        print(f"❌ Ошибка парсинга ДтЗ: {e}")
        return [], {}, ""

def parse_zakup_soglasovanie(filename=DATA_ZAKUP_SOGLAS):
    """Парсер для файла согласования закупщиками"""
    if not os.path.exists(filename):
        print(f"⚠️ Файл {filename} не найден.")
        return []

    try:
        # Читаем файл. Если шапка не на 1-й строке, нужно будет добавить skiprows
        df = pd.read_excel(filename)
        cols = df.columns
        
        # Ищем нужные колонки
        predmet_col = next((c for c in cols if 'предмет' in str(c).lower()), None)
        emp_col = next((c for c in cols if 'исполнитель' in str(c).lower()), None)
        org_col = next((c for c in cols if 'организац' in str(c).lower()), None)
        date_col = next((c for c in cols if 'дата окончания' in str(c).lower()), None)
        days_col = next((c for c in cols if 'дней' in str(c).lower()), None)

        if not emp_col or not days_col:
            print("❌ Не найдены основные колонки (Исполнитель / Дней).")
            return []

        df = df.dropna(subset=[emp_col, days_col])
        
        result = []
        for _, row in df.iterrows():
            # Дата окончания
            date_str = ''
            if date_col and pd.notna(row[date_col]):
                try:
                    date_str = pd.to_datetime(row[date_col], dayfirst=True).strftime('%Y-%m-%d')
                except: pass

            # Количество дней
            try:
                days = int(float(str(row[days_col]).replace(',', '.').strip()))
            except:
                days = 0

            result.append([
                str(row.get(predmet_col, 'Без названия')).strip() if predmet_col else 'Без названия',
                str(row.get(emp_col, 'Неизвестный')).strip(),
                str(row.get(org_col, 'Не указана')).strip() if org_col else 'Не указана',
                date_str,
                days
            ])
            
        print(f"✅ Загружено {len(result)} строк по согласованию закупщиков.")
        return result
    except Exception as e:
        print(f"❌ Ошибка парсинга закупщиков: {e}")
        return []

def update_achievements_archive(data_1c, data_sed):
    """Считает ачивки за завершенные периоды и сохраняет их в архив"""
    archive = []
    if os.path.exists(ARCHIVE_FILE):
        try:
            with open(ARCHIVE_FILE, 'r', encoding='utf-8') as f:
                archive = json.load(f)
        except: pass

    # Группируем данные по месяцам для архива
    monthly_stats = {} 
    
    # Считаем 1С
    for row in data_1c:
        if not row.get('_parsedDate') or not row.get('Ответственный'): continue
        d = row['_parsedDate']
        month_key = d.strftime('%Y-%m')
        emp = row['Ответственный']
        
        if month_key not in monthly_stats: monthly_stats[month_key] = {}
        if emp not in monthly_stats[month_key]: monthly_stats[month_key][emp] = {'volumes': {}, 'sed_total': 0, 'sed_late': 0, 'sed_in_time': 0}
        
        doc_type = row.get('Тип', '')
        monthly_stats[month_key][emp]['volumes'][doc_type] = monthly_stats[month_key][emp]['volumes'].get(doc_type, 0) + 1

    # Считаем СЭД
    for row in data_sed:
        if not row.get('_parsedDate') or not row.get('Сотрудник'): continue
        d = row['_parsedDate']
        month_key = d.strftime('%Y-%m')
        emp = row['Сотрудник']
        
        if month_key not in monthly_stats: monthly_stats[month_key] = {}
        if emp not in monthly_stats[month_key]: monthly_stats[month_key][emp] = {'volumes': {}, 'sed_total': 0, 'sed_late': 0, 'sed_in_time': 0}
        
        monthly_stats[month_key][emp]['sed_total'] += 1
        delay = str(row.get('Задержка, раб.дней', '')).strip()
        if delay and int(delay) > 0:
            monthly_stats[month_key][emp]['sed_late'] += 1
        elif row.get('Выполнено'):
            monthly_stats[month_key][emp]['sed_in_time'] += 1

    # Проверяем, какие месяцы уже есть в архиве
    archived_months = set([item.get('month') for item in archive])
    
    # Начисляем ачивки за месяцы, которых нет в архиве
    # (Здесь для примера добавим только "Кристальную дисциплину", 
    # чтобы не перегружать код в этот раз. Сезонные будут считаться на лету в JS)
    for month_key, emps in monthly_stats.items():
        if month_key in archived_months: continue
        
        for emp, stats in emps.items():
            # Пример: Кристальная дисциплина за месяц
            if stats['sed_late'] == 0 and stats['sed_total'] >= 10:
                archive.append({
                    "month": month_key,
                    "emp": emp,
                    "achId": "seasonal_crystal",
                    "title": "Кристальная дисциплина",
                    "icon": "💎"
                })
                
            # Пример: Объемные ачивки (можно добавить и другие)
            if stats['volumes'].get('Заказ поставщику', 0) >= 300:
                archive.append({
                    "month": month_key,
                    "emp": emp,
                    "achId": "v_orders",
                    "title": "Заказ поставщику (Серебро)",
                    "icon": "📦"
                })

    # Сохраняем
    with open(ARCHIVE_FILE, 'w', encoding='utf-8') as f:
        json.dump(archive, f, ensure_ascii=False, indent=4)
        
    return archive

def build():
    print("🚀 Сборка дашборда...")
    
     # 1. Загрузка данных
    data_1c_list = load_excel_to_json(DATA_1C, date_columns=['Дата записи документа', 'Дата'])
    
    # Загружаем второй файл 1С и объединяем со списком
    data_perenos_list = parse_perenos_file(DATA_1C_PERENOS)
    data_1c_list.extend(data_perenos_list) # <-- ДОБАВЛЯЕМ В ОБЩИЙ СПИСОК

        # Загружаем файл согласований и добавляем в общий список 1С
    data_soglas_list = parse_soglasovanie_file(DATA_1C_SOGLASOVANIE)
    data_1c_list.extend(data_soglas_list)
    
    data_sed_list = parse_sed_files()
    data_vacations_list, data_vacations_summary = parse_vacations()
    # ДОБАВЛЯЕМ ПАРСИНГ ЭДО
    data_edo_stats = parse_edo_files()
    data_diadok = parse_diadok_files()
        # Парсим согласование закупщиков
    data_zakup_list = parse_zakup_soglasovanie()

    # 2. Преобразование в JSON
    data_1c_json_str = json.dumps(data_1c_list, ensure_ascii=False)
    data_sed_json_str = json.dumps(data_sed_list, ensure_ascii=False)
    data_vac_json_str = json.dumps(data_vacations_list, ensure_ascii=False)
    data_vac_sum_json_str = json.dumps(data_vacations_summary, ensure_ascii=False)

    # 3. Чтение исходных файлов
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as f: html_content = f.read()
        with open(CSS_FILE, 'r', encoding='utf-8') as f: css_content = f.read()
        with open(JS_FILE, 'r', encoding='utf-8') as f: js_content = f.read()
        with open(CHART_JS, 'r', encoding='utf-8') as f: chart_js_content = f.read()
        with open(EXCELJS_JS, 'r', encoding='utf-8') as f: exceljs_js_content = f.read()
        with open(FILESAVER_JS, 'r', encoding='utf-8') as f: fs_js_content = f.read()
        with open(LZ_JS, 'r', encoding='utf-8') as f: lz_js_content = f.read()
    except Exception as e:
        print(f"❌ Ошибка: Не найден один из файлов (HTML/CSS/JS/ChartJS/ExcelJS/FileSaver). {e}")
        return

        # 4. Вшивание стилей и скриптов
    html_content = html_content.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css_content}\n</style>')
    html_content = html_content.replace('<script src="chart.js"></script>', f'<script>\n{chart_js_content}\n</script>')
    html_content = html_content.replace('<script src="lz-string.min.js"></script>', f'<script>\n{lz_js_content}\n</script>')
    
    html_content = html_content.replace('<script src="xlsx.full.min.js"></script>', '<!-- xlsx skipped in baked mode -->')
    html_content = html_content.replace(
        '<script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>',
        f'<script>\n{exceljs_js_content}\n</script>'
    )
    html_content = html_content.replace(
        '<script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"></script>',
        f'<script>\n{fs_js_content}\n</script>'
    )
    
            # --- ВШИВАЕМ ЛОГОТИП (В ШАПКУ) ---
    logo_path = None
    for candidate in ['logo.svg', 'logo.png', 'logo.jpg', 'logo.jpeg']:
        if os.path.exists(candidate):
            logo_path = candidate
            break

    if logo_path:
        with open(logo_path, 'rb') as img_file:
            encoded_string = base64.b64encode(img_file.read()).decode('utf-8')
            
            if logo_path.endswith('.svg'):
                mime = 'image/svg+xml'
            elif logo_path.endswith('.png'):
                mime = 'image/png'
            elif logo_path.endswith(('.jpg', '.jpeg')):
                mime = 'image/jpeg'
            else:
                mime = 'image/png'
            
            # Заменяем ТОЛЬКО картинку в шапке (src=...)
            for ext in ['svg', 'png', 'jpg', 'jpeg']:
                html_content = html_content.replace(
                    f'src="logo.{ext}"',
                    f'src="data:{mime};base64,{encoded_string}"'
                )
        print(f"✅ Логотип вшит.")

        # --- ВШИВАЕМ ОТДЕЛЬНЫЙ ФАВИКОН (В ИКОНКУ ВКЛАДКИ) ---
    favicon_path = None
    for candidate in ['favicon.webp', 'favicon.png', 'favicon.jpg', 'favicon.ico', 'logo.jpg', 'logo.png']:
        if os.path.exists(candidate):
            favicon_path = candidate
            break

    if favicon_path:
        with open(favicon_path, 'rb') as img_file:
            encoded_favicon = base64.b64encode(img_file.read()).decode('utf-8')
            
            if favicon_path.endswith('.webp'):
                fav_mime = 'image/webp'
            elif favicon_path.endswith('.png'):
                fav_mime = 'image/png'
            elif favicon_path.endswith(('.jpg', '.jpeg')):
                fav_mime = 'image/jpeg'
            elif favicon_path.endswith('.ico'):
                fav_mime = 'image/x-icon'
            else:
                fav_mime = 'image/png'

            # Заменяем ТОЛЬКО иконку вкладки (href=...)
            for ext in ['webp', 'png', 'jpg', 'jpeg', 'ico', 'svg']:
                html_content = html_content.replace(
                    f'href="favicon.{ext}"',
                    f'href="data:{fav_mime};base64,{encoded_favicon}"'
                )
                # На случай, если в HTML остался старый logo.jpg
                html_content = html_content.replace(
                    f'href="logo.{ext}"',
                    f'href="data:{fav_mime};base64,{encoded_favicon}"'
                )
        print(f"✅ Фавикон вшит.")

    # 6. Вшивание карты Амурской области
    map_path = 'amur_map.webp'
    if os.path.exists(map_path):
        with open(map_path, 'rb') as img_file:
            encoded_map = base64.b64encode(img_file.read()).decode('utf-8')
            html_content = html_content.replace('src="amur_map.webp"', f'src="data:image/webp;base64,{encoded_map}"')
        print(f"✅ Карта Амурской области вшита.")
    else:
        print("⚠️ Файл amur_map.png не найден. Карта не будет отображаться.")

               # --- ОПТИМИЗАЦИЯ ДАННЫХ (Техники 1, 2, 3) ---
    print("⚙️ Оптимизация данных...")
    
    unique_employees = set()
    unique_types = set()
    
    raw_1c = []
    for row in data_1c_list:
        keys = list(row.keys())
        date_key = next((k for k in keys if 'дата' in k.lower()), None)
        type_key = next((k for k in keys if 'тип' in k.lower()), None)
        emp_key = next((k for k in keys if 'ответствен' in k.lower()), None)
        
        if not date_key or not row.get(date_key): continue
        
        date_str = str(row[date_key])
        # Надежная проверка года (отсекаем всё, что младше 2026)
        try:
            year = pd.to_datetime(date_str, dayfirst=True, errors='coerce').year
            if year < 2026: continue
        except:
            continue # Если дату не удалось распарсить, пропускаем
            
        doc_type = str(row[type_key]) if type_key else "Другой"
        emp_name = str(row[emp_key]) if emp_key else "Неизвестный"
        
        unique_types.add(doc_type)
        unique_employees.add(emp_name)
        
                # Достаем данные (если их нет — ставим пустые значения)
        days_val = row.get('Дней согласования', 0)
        org_name = row.get('Organization', '')       
        # Всегда добавляем 5 элементов в массив
        raw_1c.append([date_str, doc_type, emp_name, days_val, org_name])

    raw_sed = []
    for row in data_sed_list:
        date_key = next((k for k in row.keys() if k.lower() == 'создано'), None)
        if not date_key or not row.get(date_key): continue
        
        date_str = str(row[date_key])
        # Надежная проверка года для СЭД
        try:
            year = pd.to_datetime(date_str, dayfirst=True, errors='coerce').year
            if year < 2026: continue
        except:
            continue
        
        emp_name = str(row.get('Сотрудник', 'Неизвестный'))
        unique_employees.add(emp_name)
        
        raw_sed.append([
            str(row.get('Тема', '')),
            str(row.get('Автор задачи', '')),
            date_str,
            str(row.get('Срок', '')),
            str(row.get('Выполнено', '')),
            str(row.get('Задержка, раб.дней', '') or row.get('Задержка', '')),
            emp_name
        ])

    unique_types = sorted(list(unique_types))
    unique_employees = sorted(list(unique_employees))
    
    type_to_idx = {t: i for i, t in enumerate(unique_types)}
    emp_to_idx = {e: i for i, e in enumerate(unique_employees)}

    final_1c = [[row[0], type_to_idx[row[1]], emp_to_idx[row[2]], row[3], row[4]] for row in raw_1c]
    final_sed = [[r[0], r[1], r[2], r[3], r[4], r[5], emp_to_idx[r[6]]] for r in raw_sed]

    # Сжимаем в Base64
    lz = lzstring.LZString()
    compressed_1c = lz.compressToBase64(json.dumps(final_1c, ensure_ascii=False))
    compressed_sed = lz.compressToBase64(json.dumps(final_sed, ensure_ascii=False))
    compressed_vac = lz.compressToBase64(json.dumps(data_vacations_list, ensure_ascii=False))
    compressed_vac_sum = lz.compressToBase64(json.dumps(data_vacations_summary, ensure_ascii=False))
    compressed_zakup = lz.compressToBase64(json.dumps(data_zakup_list, ensure_ascii=False))
    # --- ДОБАВИТЬ В build() ---
    data_dtz_list, data_dtz_stats, dtz_report_date = parse_dtz_files()
    compressed_dtz = lz.compressToBase64(json.dumps(data_dtz_list, ensure_ascii=False))
    compressed_dtz_stats = lz.compressToBase64(json.dumps(data_dtz_stats, ensure_ascii=False))
    # Собираем отдельный список ТОЛЬКО для проблемных строк (где > 3 дней)
    problem_soglas = []
    for row in data_1c_list:
        if row.get('Тип') == 'Согласование строк потребности' and int(row.get('Дней согласования', 0)) > 3:
            problem_soglas.append([
                str(row.get('Дата', '')),
                str(row.get('Ответственный', '')),
                int(row.get('Дней согласования', 0)),
                str(row.get('Predmet', 'Без названия'))
            ])
    compressed_problem_soglas = lz.compressToBase64(json.dumps(problem_soglas, ensure_ascii=False))
        # Собираем данные по переносам для Панели руководителя
    transfers_data = []
    for row in data_1c_list:
        if row.get('Тип') == 'Перенос срока поставки':
            transfers_data.append([
                str(row.get('Дата', '')),
                str(row.get('DocResponsible', '')),
                str(row.get('OldDate', '')),
                str(row.get('NewDate', '')),
                int(row.get('DiffDays', 0)),
                str(row.get('Reason', '')),
                str(row.get('Predmet', '')),
                str(row.get('DocumentNumber', ''))
            ])
    compressed_transfers = lz.compressToBase64(json.dumps(transfers_data, ensure_ascii=False))

    # Добавляем отладочный вывод в консоль Python (чтобы ты видел, что данные есть)
    print(f"📦 1С: строк в JSON={len(final_1c)}. Размер сжатых данных={len(compressed_1c)} символов")
    print(f"📦 СЭД: строк в JSON={len(final_sed)}. Размер сжатых данных={len(compressed_sed)} символов")
    print(f"📦 Проблемные строки: {len(problem_soglas)} шт.")

    data_edo_json_str = json.dumps(data_edo_stats, ensure_ascii=False)
    compressed_edo = lz.compressToBase64(data_edo_json_str)
            # --- СВЕРКА ЭДО И ДИАДОК ---
    import re
    
    # Наш белый список (контрагенты и внутренние организации)
    WHITE_LIST = [
        'Министерство лесного хозяйства', 'Аптрейд', 'Смартвэй',
        'Атлас Майнинг', 'Покровский рудник', 'Албынский рудник', 'Маломырский рудник',
        'Транзит', 'ТЭМИ', 'Регис', 'БРМЗ', 'Покровский горный колледж'
    ]

    # Собираем статистику по ИНН
    contractor_paper_counts = {} # { ИНН: кол-во бумажных }
    contractor_names = {}        # { ИНН: название из 1С }
    contractor_orgs = {}         # { ИНН: set(БЕ) }

    for row in data_edo_stats:
        # row: [Дата, Организация, Контрагент_ИНН, Канал]
        date_str, org, cont_raw, channel = row
        
        # Извлекаем ИНН
        match = re.search(r'\b(\d{10}|\d{12})\b', cont_raw)
        if not match: continue
        inn = match.group(1)
        
        # Проверяем, есть ли контрагент в белом списке (по названию)
        is_white = any(w.lower() in cont_raw.lower() for w in WHITE_LIST)
        if is_white: continue

        if inn not in contractor_names:
            contractor_names[inn] = cont_raw
            contractor_orgs[inn] = set()
            contractor_paper_counts[inn] = 0

        contractor_orgs[inn].add(org)
        if channel.lower() != 'эдо':
            contractor_paper_counts[inn] += 1

    diadok_matches = []
    diadok_blind_zones = []

    for inn, paper_count in contractor_paper_counts.items():
        if paper_count == 0: continue # Если нет бумаги, не показываем
        
        orgs_str = ", ".join(list(contractor_orgs[inn]))
        name = contractor_names[inn]
        
        if inn in data_diadok:
            # Сбой (есть в Диадоке, но есть бумага)
            # Формат: [Название, ИНН, ID_Диадок, Бумажных, БЕ]
            diadok_matches.append([name, inn, data_diadok[inn]['id_string'], paper_count, orgs_str])
        else:
            # Слепая зона (нет в Диадоке, есть бумага)
            # Формат: [Название, ИНН, Бумажных, БЕ]
            diadok_blind_zones.append([name, inn, paper_count, orgs_str])

    # Сортируем по убыванию количества бумажных документов
    diadok_matches.sort(key=lambda x: x[3], reverse=True)
    diadok_blind_zones.sort(key=lambda x: x[2], reverse=True)

    compressed_diadok_matches = lz.compressToBase64(json.dumps(diadok_matches, ensure_ascii=False))
    compressed_diadok_blind = lz.compressToBase64(json.dumps(diadok_blind_zones, ensure_ascii=False))

    # Обновляем архив ачивок
    archived_data = update_achievements_archive(data_1c_list, data_sed_list)
    compressed_archive = lz.compressToBase64(json.dumps(archived_data, ensure_ascii=False))
    
    
    # Формируем скрипт
    data_script = f"""
    <script>
        window.bakedEmployees = {json.dumps(unique_employees, ensure_ascii=False)};
        window.bakedTypes = {json.dumps(unique_types, ensure_ascii=False)};
        
        window.bakedData1C = "{compressed_1c}";
        window.bakedDataSED = "{compressed_sed}";
        window.bakedDataVacations = "{compressed_vac}";
        window.bakedDataVacSummary = "{compressed_vac_sum}";
        window.bakedProblemSoglas = "{compressed_problem_soglas}"; // <-- ДОБАВИЛИ
        window.bakedDataEDO = "{compressed_edo}"; <!-- ДОБАВИЛИ ЭДО -->
        window.bakedTransfers = "{compressed_transfers}"; <!-- ДОБАВИЛИ ПЕРЕНОСЫ -->
        window.bakedDiadokMatches = "{compressed_diadok_matches}";
        window.bakedDiadokBlind = "{compressed_diadok_blind}";
        window.bakedDtZData = "{compressed_dtz}";
        window.bakedDtZStats = "{compressed_dtz_stats}";
        window.bakedDtZDate = "{dtz_report_date}";
        window.bakedZakupSoglas = "{compressed_zakup}"
        window.bakedAchievementsArchive = "{compressed_archive}";
    </script>
    """
    html_content = html_content.replace('<script src="script.js"></script>', f'{data_script}\n<script>\n{js_content}\n</script>', 1)
    
    # Убираем возможные старые подключения data.js, если они остались
    html_content = html_content.replace('<script src="data.js"></script>', '')
    

    # 8. Сохранение результата
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"✅ Успех! Файл {OUTPUT_FILE} создан.")

if __name__ == '__main__':
    build()

def update_achievements_archive(data_1c, data_sed):
    """Считает ачивки за завершенные периоды и сохраняет их в архив"""
    archive = []
    if os.path.exists(ARCHIVE_FILE):
        try:
            with open(ARCHIVE_FILE, 'r', encoding='utf-8') as f:
                archive = json.load(f)
        except: pass

    # Группируем данные по месяцам для архива
    monthly_stats = {} 
    
    # Считаем 1С
    for row in data_1c:
        if not row.get('_parsedDate') or not row.get('Ответственный'): continue
        # Берем только завершенные месяцы (до текущего)
        d = row['_parsedDate']
        month_key = d.strftime('%Y-%m')
        emp = row['Ответственный']
        
        if month_key not in monthly_stats: monthly_stats[month_key] = {}
        if emp not in monthly_stats[month_key]: monthly_stats[month_key][emp] = {'volumes': {}, 'sed_total': 0, 'sed_late': 0, 'sed_in_time': 0}
        
        doc_type = row.get('Тип', '')
        monthly_stats[month_key][emp]['volumes'][doc_type] = monthly_stats[month_key][emp]['volumes'].get(doc_type, 0) + 1

    # Считаем СЭД
    for row in data_sed:
        if not row.get('_parsedDate') or not row.get('Сотрудник'): continue
        d = row['_parsedDate']
        month_key = d.strftime('%Y-%m')
        emp = row['Сотрудник']
        
        if month_key not in monthly_stats: monthly_stats[month_key] = {}
        if emp not in monthly_stats[month_key]: monthly_stats[month_key][emp] = {'volumes': {}, 'sed_total': 0, 'sed_late': 0, 'sed_in_time': 0}
        
        monthly_stats[month_key][emp]['sed_total'] += 1
        delay = str(row.get('Задержка, раб.дней', '')).strip()
        if delay and int(delay) > 0:
            monthly_stats[month_key][emp]['sed_late'] += 1
        elif row.get('Выполнено'):
            monthly_stats[month_key][emp]['sed_in_time'] += 1

    # Проверяем, какие месяцы уже есть в архиве
    archived_months = set([item['month'] for item in archive])
    
    # Начисляем ачивки за месяцы, которых нет в архиве
    # (Для примера, берем только объемные ачивки, чтобы не усложнять Python)
    # В идеале, здесь же можно считать и Спринтеров, и Молний.
    # Пока сделаем базовую логику для объема.
    
    # Сохраняем
    with open(ARCHIVE_FILE, 'w', encoding='utf-8') as f:
        json.dump(archive, f, ensure_ascii=False, indent=4)
        
    return archive