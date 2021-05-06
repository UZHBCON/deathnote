import React from "react"

function Table() {
    return (
        <table class="table is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>Voters</th>
            <th>Benficiaries</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            <td>38</td>
            <td>38</td>
          </tr>
          <tr>
            <td>7</td>
            <td>65</td>
            <td>36</td>
          </tr>
        </tbody>
      </table>
    )
}

export default Table