const helpers = {
    formatDate: (date: string) => {
        return new Date(date).toLocaleDateString();
    },
};

export default helpers;
