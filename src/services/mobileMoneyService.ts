// /c:/Users/hp/didi-delight001/Didi-delight/src/services/mobileMoneyService.ts

interface Transaction {
    id: string;
    amount: number;
    sender: string;
    receiver: string;
    date: Date;
}

class MobileMoneyService {
    private transactions: Transaction[] = [];

    constructor() {}

    public sendMoney(sender: string, receiver: string, amount: number): Transaction {
        const transaction: Transaction = {
            id: this.generateTransactionId(),
            amount,
            sender,
            receiver,
            date: new Date(),
        };

        this.transactions.push(transaction);
        return transaction;
    }

    public getTransactionById(id: string): Transaction | undefined {
        return this.transactions.find(transaction => transaction.id === id);
    }

    public getAllTransactions(): Transaction[] {
        return this.transactions;
    }

    private generateTransactionId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export default MobileMoneyService;