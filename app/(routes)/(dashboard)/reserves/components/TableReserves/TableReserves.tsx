import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fromatPrice } from "@/lib/formatPrice";
import { TableReservesProps } from "./TablaReserves.type";
  
export function TableReserves(props: TableReservesProps) {
    const {orders} = props;
    const totalAmount = orders.reduce((acc, booking) => {
        return acc + parseFloat(booking.totalAmount);
    },0);

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent bookings.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Car</TableHead>
                        <TableHead>Date Start</TableHead>
                        <TableHead>Date End</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.carName}</TableCell>
                            <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(order.orderEndDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <div className="p-2 text-white bg-green-600 rounded-lg w-fit">
                                    {order.status}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                U{fromatPrice(Number(order.totalAmount))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-right">U{fromatPrice(totalAmount)}</TableCell>
                </TableFooter>
            </Table>
        </div>
    );
}
