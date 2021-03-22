import pandas as pd
import yfinance as yf

stock_list = pd.read_csv("SP500StockList.csv")

start_date = '2000-01-01'
end_date = '2020-01-01'

all_stocks = pd.DataFrame(columns=['StockID', 'Date', 'Open', 'High', 'Low', 'Close', 'Adj Close'])

for index, row in stock_list.iterrows():
    print("Downloading %s - %i/%i" % (row['Company'], index+1, 500))
    symbol_data = yf.download(row['Symbol'].replace('.', '-'), 
                    start=start_date,
                    end=end_date, 
                    progress=True)
    symbol_data['StockID'] = index
    all_stocks = all_stocks.append(symbol_data, ignore_index=True)

all_stocks.to_csv("AllStockData.csv")