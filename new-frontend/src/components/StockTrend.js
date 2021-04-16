import React from 'react';
import ShowGraph from './ShowGraph';
 
function StockTrend() {

    const data = [
        {
          label: 'Series 1',
          data: [[0, -2], [1, 2], [2, 4], [3, 2], [4, 7]]
        },
        {
          label: 'Series 2',
          data: [[0, 3], [1, 1], [2, 5], [3, 6], [4, 4]]
        }
      ];
    
      const axis = [
        { primary: true, type: 'linear', position: 'bottom' },
        { type: 'linear', position: 'left' }
      ];

    return (
        <div>
            <ShowGraph data={data} axis={axis}/>
        </div>
    );
}
export default StockTrend;