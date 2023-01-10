# selenium
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
# random
import time
# threading
from threading import Thread

# constants
THREADS = 4 # number of threads
URL = "https://apps.cpp.edu/bronco411/search/" # bronco 411 url
professors = set() # set for professors

def convert_professors(professors: set) -> None:
    """This converts the set of professors to the txt file

    Args:
        professors (set): all professors
    """
    with open("scraper/professors/professors.txt", "w") as txt_file:
        for prof in professors:
            txt_file.write(prof + "\n")

def split_letters(letters:list, chunks:int) -> list:
    """This function returns a list of x number of lists with length of chunks

    Args:
        letters (list): list of all letter combinations
        chunks (int): how large each chunk will be
    """
    for i in range(0, len(letters), chunks):
        yield letters[i:i + chunks]

def format_name(name: str) -> str:
    """This function takes in a professor name and formats the return

    Args:
        name (str): professor name

    Returns:
        str: formatted professor name
    """
    return name.split('\n')[0]

def search(driver, letter: str) -> None:
    """This function runs the search for Bronco 411

    Args:
        driver (_type_): driver object
        letter (str): search input
    """
    # letter
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_prsn_name"))).send_keys(letter)
    
    # buttons
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_CK_STAFF"))).click() # staff
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_CK_OTHERS"))).click() # other
    
    # submit
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_PublicSearchButton"))).click()
    
    # get professor names, format the name, and add them to the set
    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//table[@id='ctl00_ContentPlaceHolder1_PeopleGV']/tbody/tr/td[1]")))
    time.sleep(2)
    rows = driver.find_elements(By.XPATH, "//table[@id='ctl00_ContentPlaceHolder1_PeopleGV']/tbody/tr/td[1]")
    for name in rows:
        professors.add(format_name(name.text))

def main(thread_name: int, letters: list):
    # opens webdriver
    print(f"[thread {thread_name}]\tstarting driver...")
    driver = webdriver.Chrome()

    # iterates each letter in letters
    for letter in letters:   
        # navigates to bronco411
        driver.get(URL) 
        driver.execute_script("document.body.style.zoom='50%'")
        time.sleep(2)

        # search function
        print(f"[thread {thread_name}]\tstarting search ({letter})...")
        try:
            search(driver, letter)
            print(f"+ [thread {thread_name}]\tsuccessfully checked ({letter})!")
        except:
            letters.append(letter)
            print(f"- [thread {thread_name}]\tfailed retrying later ({letter})...")
    
    print(f"*** thread {thread_name} has finished")

if __name__ == '__main__':
    # list of all letter (aa-zz)
    letters = []
    for i in range(97, 123):
        for j in range(97, 123):
            letters.append(chr(i)+chr(j))
    letters = list(split_letters(letters, len(letters)//THREADS))

    # make threads
    t = []
    for i in range(THREADS):
        searchThread = Thread(target=main, args=[i+1, letters[i]])
        t.append(searchThread)

    # start threads
    for thread in t:
        thread.start()
    
    # wait threads
    for thread in t:
        thread.join()

    # threads are finished
    print(f"\n\nname scraping process complete!\ntotal professors: {len(professors)}\n{professors}", flush=False)
    convert_professors(professors)