//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int numsSize = sc.nextInt();
        List<Integer> nums = new ArrayList<>();
        for (int i = 0; i < numsSize; i++) nums.add(sc.nextInt());
        Solution sol = new Solution();
        void result = sol.nextPermutation(nums);
        System.out.println(result);
    }
}