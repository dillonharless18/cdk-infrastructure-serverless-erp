const getPageNoAndOffset = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    const offset = (pageNumber - 1) * pageSize;

    return { pageNumber, offset };
};

export { getPageNoAndOffset };
