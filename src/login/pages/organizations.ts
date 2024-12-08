export const loadOrganizationOptions = async () => {
    return await fetch(
        "https://bowie-filiere.github.io/demo-stamps/organizations.json"
    ).then(async r => {
        if (r.ok) {
            return (await r.json()) as OrganizationOption[];
        } else
            return [
                { name: "Autre", options: ["Aucune", "Insee"] }
            ] as OrganizationOption[];
    });
};

export type OrganizationOption = {
    name: string;
    options: string[];
};
