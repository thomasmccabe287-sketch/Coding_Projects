#include <cs50.h>
#include <stdio.h>

int calculate_quarters(int change);
int calculate_dime(int change);
int calculate_nickle(int change);
int calculate_penny(int change);

int main(void)
{
    int change;
    do
    {
        change = get_int("Change Owed: ");
    }
    while (change < 0);

    int quarter = calculate_quarters(change);

    change = change - (quarter * 25);

    int dime = calculate_dime(change);

    change = change - (dime * 10);

    int nickle = calculate_nickle(change);

    change = change - (nickle * 5);

    int penny = calculate_penny(change);

    change = change - (penny * 1);

    int sum = quarter + dime + nickle + penny;

    printf("sum: %i\n", sum);
}

int calculate_quarters(int change)
{
    int quarter = 0;
    while (change >= 25)
    {
        quarter++;
        change = change - 25;
    }
    return quarter;
}

int calculate_dime(int change)
{
    int dime = 0;
    while (change >= 10)
    {
        dime++;
        change = change - 10;
    }
    return dime;
}

int calculate_nickle(int change)
{
    int nickle = 0;
    while (change >= 5)
    {
        nickle++;
        change = change - 5;
    }
    return nickle;
}

int calculate_penny(int change)
{
    int penny = 0;
    while (change >= 1)
    {
        penny++;
        change = change - 1;
    }
    return penny;
}
