import React from "react";
import { Accordion, Card, Table, Form } from "react-bootstrap";

const CompanyKickOffCustomerRequirements = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
}) => (
  <Card className="mb-3 shadow-sm border-0">
    <CustomToggle
      eventKey={eventKey}
      activeKey={activeKey}
      onClick={() => handleAccordionClick(eventKey)}
    >
      Customer Requirements
    </CustomToggle>
    <Accordion.Collapse eventKey={eventKey}>
      <Card.Body>
        <Table bordered hover responsive className="mb-0">
          <tbody>
            {/* Row 1 */}
            <tr>
              <th className="bg-primary text-white">Inserts (Main/CAM)</th>
              <td>SDK11</td>
              <td>HCHCR</td>
              <td>D2 IMP</td>
              <td>HMD5</td>
            </tr>

            {/* Row 2 */}
            <tr>
              <th className="bg-primary text-white">Standard Material</th>
              <td>Misumi</td>
              <td>Fibro</td>
              <td>Avi Oilless</td>
              <td>Pawan</td>
            </tr>

            {/* Row 3 */}
            <tr>
              <th className="bg-primary text-white">Heat Treatment HT</th>
              <td>VACCUM HT</td>
              <td>Normal</td>
              <td>No</td>
              <td>Extra At Actual</td>
            </tr>

            {/* Row 4 */}
            <tr>
              <th className="bg-primary text-white">HT Certificate</th>
              <td>Required</td>
              <td>Not Required</td>
              <td>-</td>
              <td>-</td>
            </tr>

            {/* Row 5 */}
            <tr>
              <th className="bg-primary text-white">Tool Construction</th>
              <td>SG600</td>
              <td>FG300</td>
              <td>GGG70L</td>
              <td>FCD550</td>
            </tr>

            {/* Row 6 */}
            <tr>
              <th className="bg-primary text-white">Coating Considered</th>
              <td>At Actual</td>
              <td>PVD Coating At Bohler Only</td>
              <td>Hardchrome</td>
              <td>Epoxy</td>
            </tr>

            {/* Row 7 */}
            <tr>
              <th className="bg-primary text-white">Tryout RM</th>
              <td>Customer Scope</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>

            {/* Row 8 */}
            <tr>
              <th className="bg-primary text-white">Spare Quantity</th>
              <td>No</td>
              <td>10% BOM Quantity (Minimum 1)</td>
              <td>-</td>
              <td>-</td>
            </tr>

            {/* Row 9 */}
            <tr>
              <th className="bg-primary text-white">Spare Items</th>
              <td>Critical Inserts</td>
              <td>Die Buttons & Punch</td>
              <td>Coil Springs</td>
              <td>Gas Springs / Stripper Bolt</td>
            </tr>

            {/* Row 10 */}
            <tr>
              <th className="bg-primary text-white">Tool Life Considered</th>
              <td>Proto</td>
              <td>2 Lacs</td>
              <td>5 Lacs</td>
              <td>10 Lacs</td>
            </tr>

            {/* Row 11 */}
            <tr>
              <th className="bg-primary text-white">Checking Fixture</th>
              <td>Not In Our Scope</td>
              <td>Aluminum</td>
              <td>Steel Body</td>
              <td>CIBA</td>
            </tr>

            {/* Row 12 */}
            <tr>
              <th className="bg-primary text-white">Transport</th>
              <td>Customer Scope</td>
              <td>Planetto Scope</td>
              <td>-</td>
              <td>-</td>
            </tr>

            {/* Row 13 */}
            <tr>
              <th className="bg-primary text-white">Remarks</th>
              <td colSpan="4">
                <Form.Control type="text" placeholder="Enter remarks here" />
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Accordion.Collapse>
  </Card>
);

export default CompanyKickOffCustomerRequirements;
