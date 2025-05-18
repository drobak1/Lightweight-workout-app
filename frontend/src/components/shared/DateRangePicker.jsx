import React from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"
import { Form } from "react-bootstrap";

/**
 * DateRangePicker komponenta pro výběr začátku a konce období.
 * Props:
 *  - startDate: Date | null
 *  - endDate: Date | null
 *  - onDatesChange: (start: Date | null, end: Date | null) => void
 */
function DateRangePicker({ startDate, endDate, onDatesChange}) {
    return (
        <Form.Group>
            <Form.Label>Období:</Form.Label>
            <div>
                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(dates) => {
                        const [start, end] = dates;
                        onDatesChange(start, end);
                    }}
                    dateFormat="dd.MM.yyyy"
                    className="form-control"
                    placeholderText="Vyberte začátek a konec"
                />
            </div>
        </Form.Group>
    );
}

export default DateRangePicker;